'use client';

import { useEffect, useState } from 'react';
import { useRouter }   from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  // isLoading is true until we've confirmed whether to show Auth UI or redirect
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // console.log(`Auth event: ${event}`, session); // For debugging

      if (session) {
        // User is logged in or session restored
        router.push('/dashboard');
      } else {
        // User is not logged in (e.g. SIGNED_OUT, or INITIAL_SESSION with no user)
        // It's now safe to stop loading and potentially show the Auth UI
        setIsLoading(false);
      }
    });

    // Also, perform an initial session check.
    // This covers cases where onAuthStateChange with INITIAL_SESSION might be delayed,
    // or if the component mounts and there's already a valid session.
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session) {
        router.push('/dashboard');
        // No need to call setIsLoading(false) as we are navigating away.
      } else {
        // No session found initially. onAuthStateChange will likely also confirm this
        // and call setIsLoading(false). Calling it here too is safe if not already false.
        if (isMounted) setIsLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase, router]); // Dependencies for useEffect

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <p>加载中...</p>
      </div>
    );
  }

  // If not loading, and we haven't been redirected, it means no session was found.
  // So, show the Auth UI.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // Ensure NEXT_PUBLIC_SITE_URL is defined in your .env.local
  const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>登录或注册</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark" // Or "light" or "default" based on your preference
          providers={['github']} // Add other providers if needed, e.g., 'google'
          redirectTo={redirectTo}
          socialLayout="horizontal"
          // view="sign_in" // You can set a default view: "sign_in", "sign_up", "forgotten_password"
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '登录',
                social_provider_text: '使用 {{provider}} 登录',
                link_text: '已经有账户了？登录'
              },
              sign_up: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '注册',
                social_provider_text: '使用 {{provider}} 注册',
                link_text: '还没有账户？注册'
              },
              forgotten_password: {
                email_label: '邮箱地址',
                button_label: '发送重置密码指令',
                link_text: '返回登录'
              },
              update_password: {
                password_label: '新密码',
                button_label: '更新密码',
                loading_button_label: '正在更新密码...'
              },
              magic_link: {
                email_input_label: '邮箱地址',
                email_input_placeholder: '您的邮箱地址',
                button_label: '发送魔法链接',
                loading_button_label: '正在发送...',
                link_text: '通过魔法链接登录',
                confirmation_text: '检查您的邮箱以获取魔法链接'
              }
            }
          }}
        />
      </div>
    </div>
  );
}
