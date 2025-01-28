import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOrbis } from "@orbisclub/components";
import Header from '../../components/Header';
import LeftSidebar from '../../components/LeftSidebar';
import Sidebar from '../../components/Sidebar';
import UserProfile from '../../components/UserProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { did } = router.query;
  const { orbis } = useOrbis();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (did) {
      loadProfile();
    }

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        // Get profile details
        const { data: profileData, error: profileError } = await orbis.getProfile(did);
        if (profileError) throw new Error(profileError);

        // Get user's posts
        const { data: postsData } = await orbis.getPosts({ did: did });

        // Get social connections using the correct API endpoints
        const [followersRes, followingRes] = await Promise.all([
          orbis.api.from("orbis_connections")
            .select()
            .eq('following_profile', did)
            .eq('active', true),
          orbis.api.from("orbis_connections")
            .select()
            .eq('did_profile', did)
            .eq('active', true)
        ]);

        // Get credentials
        const { data: credentials } = await orbis.api.rpc("get_verifiable_credentials", {
          q_subject: did,
          q_min_weight: 10
        });

        // Combine all data
        const enrichedProfile = {
          ...profileData,
          posts: postsData || [],
          followers: followersRes.data || [],
          following: followingRes.data || [],
          credentials: credentials || []
        };

        console.log("Loaded profile data:", enrichedProfile);
        setUserDetails(enrichedProfile);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [did, orbis]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error loading profile</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{userDetails?.profile?.username || 'User Profile'} | YouBuidl</title>
        <meta name="description" content={userDetails?.profile?.description || 'User profile on YouBuidl'} />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <div className="flex-1 pt-16">
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          <div className="w-full md:ml-64 md:mr-80">
            <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color)]"></div>
                </div>
              ) : (
                userDetails && <UserProfile details={userDetails} initialData={userDetails} />
              )}
            </main>
          </div>

          <div className="hidden md:block fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-100 overflow-y-auto no-scrollbar">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}