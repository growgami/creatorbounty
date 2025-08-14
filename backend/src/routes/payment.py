import os
import logging
from flask import Blueprint, request, jsonify
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from eth_account import Account
from dotenv import load_dotenv
from decimal import Decimal

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

payment_bp = Blueprint('payment', __name__)

# Plasma Testnet Configuration
# Configuration
PLASMA_RPC_URL = os.getenv('PLASMA_RPC_URL', 'https://testnet-rpc.plasma.to')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
CHAIN_ID = 9746

# Initialize Web3 connection
w3 = Web3(Web3.HTTPProvider(PLASMA_RPC_URL))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

# Validate connection and initialize account
if not w3.is_connected():
    raise Exception("Cannot connect to Plasma testnet")

if not PRIVATE_KEY:
    raise Exception("Private key not configured")

try:
    clean_private_key = PRIVATE_KEY.strip()
    if clean_private_key.startswith('0x'):
        clean_private_key = clean_private_key[2:]
    
    if len(clean_private_key) != 64:
        raise ValueError(f"Private key must be 64 hex characters, got {len(clean_private_key)}")
    
    int(clean_private_key, 16)
    account = Account.from_key(clean_private_key)
    
except ValueError:
    raise Exception("Invalid private key format - must be 64 hex characters without 0x prefix")
except Exception:
    raise Exception("Invalid private key configuration")

# ERC-20 Token ABI (simplified for transfer function)
ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
]

def validate_address(address):
    """Validate Ethereum address format"""
    if not address or not isinstance(address, str):
        return False
    
    address = address.strip()
    
    if not address.startswith('0x') or len(address) != 42:
        return False
    
    try:
        int(address, 16)
        return Web3.is_address(address) and Web3.is_checksum_address(Web3.to_checksum_address(address))
    except Exception:
        return False

def get_gas_price():
    """Get current gas price with fallback"""
    try:
        return w3.eth.gas_price
    except:
        return w3.to_wei(20, 'gwei')

def estimate_gas(transaction):
    """Estimate gas for transaction with fallback"""
    try:
        return w3.eth.estimate_gas(transaction)
    except:
        return 21000

@payment_bp.route('/send-native', methods=['POST'])
def send_native_payment():
    """Send native XPL tokens"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        recipient = data.get('recipient')
        amount = data.get('amount')
        
        if not recipient or not amount:
            return jsonify({'error': 'Recipient and amount are required'}), 400
        
        # Validate recipient address
        if not validate_address(recipient):
            return jsonify({'error': 'Invalid recipient address'}), 400
        
        # Validate amount
        try:
            amount_decimal = Decimal(str(amount))
            if amount_decimal <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
            amount_wei = w3.to_wei(amount_decimal, 'ether')
        except:
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Check sender balance
        sender_balance = w3.eth.get_balance(account.address)
        gas_price = get_gas_price()
        estimated_gas = 21000  # Standard gas for ETH transfer
        gas_cost = gas_price * estimated_gas
        
        if sender_balance < (amount_wei + gas_cost):
            return jsonify({
                'error': 'Insufficient balance',
                'required': str(w3.from_wei(amount_wei + gas_cost, 'ether')),
                'available': str(w3.from_wei(sender_balance, 'ether'))
            }), 400
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Build transaction
        transaction = {
            'to': Web3.to_checksum_address(recipient),
            'value': amount_wei,
            'gas': estimated_gas,
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': CHAIN_ID
        }
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_hash_hex = tx_hash.hex()
        
        return jsonify({
            'success': True,
            'transaction_hash': tx_hash_hex,
            'amount': str(amount),
            'recipient': recipient,
            'sender': account.address,
            'gas_used': estimated_gas,
            'gas_price': str(w3.from_wei(gas_price, 'gwei')) + ' gwei'
        }), 200
        
    except Exception as e:
        logger.error(f"Native payment failed: {str(e)}")
        return jsonify({'error': 'Payment failed', 'details': str(e)}), 500

@payment_bp.route('/send-token', methods=['POST'])
def send_token_payment():
    """Send ERC-20 tokens (e.g., USDT)"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        recipient = data.get('recipient')
        amount = data.get('amount')
        token_address = data.get('token_address')
        
        if not recipient or not amount or not token_address:
            return jsonify({'error': 'Recipient, amount, and token_address are required'}), 400
        
        # Validate addresses
        if not validate_address(recipient) or not validate_address(token_address):
            return jsonify({'error': 'Invalid address format'}), 400
        
        # Create token contract instance
        token_contract = w3.eth.contract(
            address=Web3.to_checksum_address(token_address),
            abi=ERC20_ABI
        )
        
        # Get token decimals
        try:
            decimals = token_contract.functions.decimals().call()
        except:
            decimals = 18  # Default to 18 decimals
        
        # Validate and convert amount
        try:
            amount_decimal = Decimal(str(amount))
            if amount_decimal <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
            amount_units = int(amount_decimal * (10 ** decimals))
        except:
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Check token balance
        try:
            sender_balance = token_contract.functions.balanceOf(account.address).call()
            if sender_balance < amount_units:
                return jsonify({
                    'error': 'Insufficient token balance',
                    'required': str(amount_decimal),
                    'available': str(Decimal(sender_balance) / (10 ** decimals))
                }), 400
        except Exception as e:
            return jsonify({'error': 'Failed to check token balance', 'details': str(e)}), 400
        
        # Check ETH balance for gas
        eth_balance = w3.eth.get_balance(account.address)
        gas_price = get_gas_price()
        estimated_gas = 65000  # Typical gas for ERC-20 transfer
        gas_cost = gas_price * estimated_gas
        
        if eth_balance < gas_cost:
            return jsonify({
                'error': 'Insufficient ETH for gas fees',
                'required': str(w3.from_wei(gas_cost, 'ether')),
                'available': str(w3.from_wei(eth_balance, 'ether'))
            }), 400
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Build token transfer transaction
        transfer_function = token_contract.functions.transfer(
            Web3.to_checksum_address(recipient),
            amount_units
        )
        
        transaction = transfer_function.build_transaction({
            'gas': estimated_gas,
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': CHAIN_ID
        })
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_hash_hex = tx_hash.hex()
        
        return jsonify({
            'success': True,
            'transaction_hash': tx_hash_hex,
            'amount': str(amount),
            'recipient': recipient,
            'sender': account.address,
            'token_address': token_address,
            'gas_used': estimated_gas,
            'gas_price': str(w3.from_wei(gas_price, 'gwei')) + ' gwei'
        }), 200
        
    except Exception as e:
        logger.error(f"Token payment failed: {str(e)}")
        return jsonify({'error': 'Token payment failed', 'details': str(e)}), 500

@payment_bp.route('/transaction-status/<tx_hash>', methods=['GET'])
def get_transaction_status(tx_hash):
    """Get transaction status and details"""
    try:
        # Validate and normalize transaction hash format
        if not tx_hash.startswith('0x'):
            tx_hash = '0x' + tx_hash
        
        if len(tx_hash) != 66:
            return jsonify({'error': 'Invalid transaction hash format'}), 400
        
        # Get transaction receipt
        try:
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            transaction = w3.eth.get_transaction(tx_hash)
            
            # Get current block number for confirmations
            current_block = w3.eth.block_number
            confirmations = current_block - receipt.blockNumber
            
            return jsonify({
                'transaction_hash': tx_hash,
                'status': 'success' if receipt.status == 1 else 'failed',
                'block_number': receipt.blockNumber,
                'confirmations': confirmations,
                'gas_used': receipt.gasUsed,
                'gas_price': str(w3.from_wei(transaction.gasPrice, 'gwei')) + ' gwei',
                'from': transaction['from'],
                'to': transaction.to,
                'value': str(w3.from_wei(transaction.value, 'ether')) + ' XPL'
            }), 200
            
        except Exception as e:
            # Transaction might be pending or not found
            try:
                # Check if transaction exists in mempool
                transaction = w3.eth.get_transaction(tx_hash)
                return jsonify({
                    'transaction_hash': tx_hash,
                    'status': 'pending',
                    'from': transaction['from'],
                    'to': transaction.to,
                    'value': str(w3.from_wei(transaction.value, 'ether')) + ' XPL'
                }), 200
            except:
                return jsonify({
                    'transaction_hash': tx_hash,
                    'status': 'not_found',
                    'error': 'Transaction not found'
                }), 404
        
    except Exception as e:
        logger.error(f"Failed to get transaction status: {str(e)}")
        return jsonify({'error': 'Failed to get transaction status', 'details': str(e)}), 500

@payment_bp.route('/balance', methods=['GET'])
def get_balance():
    """Get account balance for native tokens and specified ERC-20 tokens"""
    try:
        # Get native balance
        native_balance = w3.eth.get_balance(account.address)
        native_balance_eth = w3.from_wei(native_balance, 'ether')
        
        result = {
            'address': account.address,
            'native_balance': {
                'wei': str(native_balance),
                'ether': str(native_balance_eth),
                'symbol': 'XPL'
            }
        }
        
        # Get token balance if token address is provided
        token_address = request.args.get('token_address')
        if token_address and validate_address(token_address):
            try:
                token_contract = w3.eth.contract(
                    address=Web3.to_checksum_address(token_address),
                    abi=ERC20_ABI
                )
                
                token_balance = token_contract.functions.balanceOf(account.address).call()
                decimals = token_contract.functions.decimals().call()
                token_balance_formatted = Decimal(token_balance) / (10 ** decimals)
                
                result['token_balance'] = {
                    'raw': str(token_balance),
                    'formatted': str(token_balance_formatted),
                    'decimals': decimals,
                    'token_address': token_address
                }
            except Exception as e:
                result['token_balance_error'] = str(e)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Failed to get balance: {str(e)}")
        return jsonify({'error': 'Failed to get balance', 'details': str(e)}), 500

@payment_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check Web3 connection
        is_connected = w3.is_connected()
        latest_block = w3.eth.block_number if is_connected else None
        
        return jsonify({
            'status': 'healthy' if is_connected else 'unhealthy',
            'web3_connected': is_connected,
            'latest_block': latest_block,
            'account_address': account.address,
            'chain_id': CHAIN_ID,
            'rpc_url': PLASMA_RPC_URL
        }), 200 if is_connected else 503
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 503
