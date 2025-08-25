import NextAuth, { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import { saveUserToDatabase } from '@/features/auth/services/authService';
import type { User } from '@/models/Users';
import { JWT as NextAuthJWT } from 'next-auth/jwt';
import { determineUserRole } from '@/features/rbac/services/roleAssignmentService';

// Extend the NextAuth User type to include our custom fields
interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username: string;
    email?: string;
    profile_image_url: string;
    description?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
  };
  // Index signature for additional properties
  [key: string]: string | number | object | undefined;
}

interface ExtendedUser extends NextAuthUser {
  id: string;
  username: string;
  userPfp: string;
  wallet_address?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  role?: 'admin' | 'creator';
}

// Define the NextAuth configuration
export const authOptions = {
  // Configure authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0', // Use Twitter OAuth 2.0
      authorization: {
        url: 'https://twitter.com/i/oauth2/authorize',
        params: {
          scope: 'users.read tweet.read offline.access',
        },
      },
      profile(profile: TwitterProfile) {
        // Extract user data from Twitter profile
        return {
          id: profile.data.id,
          name: profile.data.name,
          username: profile.data.username,
          email: profile.data.email || null,
          userPfp: profile.data.profile_image_url,
          bio: profile.data.description || null,
          followers_count: profile.data.public_metrics?.followers_count || 0,
          following_count: profile.data.public_metrics?.following_count || 0,
          tweet_count: profile.data.public_metrics?.tweet_count || 0,
        } as ExtendedUser;
      },
    }),
  ],
  // Configure session behavior
  callbacks: {
    async session({ session, token }: { session: NextAuthSession; token: NextAuthJWT }) {
      // Add user data to session
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          userPfp: token.userPfp as string,
          wallet_address: token.wallet_address as string,
          bio: token.bio as string,
          followers_count: token.followers_count as number,
          following_count: token.following_count as number,
          tweet_count: token.tweet_count as number,
          role: token.role as 'admin' | 'creator',
        } as ExtendedUser;
      }
      return session;
    },
    async jwt({ token, user }: { token: NextAuthJWT; user: NextAuthUser }) {
      // Add user data to JWT token
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = user.id;
        token.username = extendedUser.username;
        token.userPfp = extendedUser.userPfp;
        token.wallet_address = extendedUser.wallet_address;
        token.bio = extendedUser.bio;
        token.followers_count = extendedUser.followers_count;
        token.following_count = extendedUser.following_count;
        token.tweet_count = extendedUser.tweet_count;
        
        // Determine user role
        try {
          const userRole = await determineUserRole(extendedUser.username);
          token.role = userRole;
          
          // Save user to database with role
          const userForDatabase: User = {
            id: extendedUser.id,
            username: extendedUser.username,
            userPfp: extendedUser.userPfp,
            name: extendedUser.name || undefined,
            email: extendedUser.email === null ? undefined : extendedUser.email,
            wallet_address: extendedUser.wallet_address,
            bio: extendedUser.bio,
            followers_count: extendedUser.followers_count,
            following_count: extendedUser.following_count,
            tweet_count: extendedUser.tweet_count,
            role: userRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveUserToDatabase(userForDatabase);
        } catch (error) {
          console.error('Error determining role or saving user to database:', error);
          token.role = 'creator'; // Fallback to creator role
        }
      }
      return token;
    },
  },
  // Configure session storage
  session: {
    strategy: 'jwt' as const,
  },
  // Configure secret for encryption
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
