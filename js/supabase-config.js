/**
 * ========================================
 * Supabase Configuration
 * نظام تقييم المركبات المستردة v7.0
 * ========================================
 */

(function() {
    'use strict';
    
    // Supabase Configuration
    const SUPABASE_URL = 'https://enrlrqjsgcpcggyuoazr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmxycWpzZ2NwY2dneXVvYXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODU0MjQsImV4cCI6MjA4Mzg2MTQyNH0.hV1-XB-CKIlRaqib8sTZjxzlbZO_5kUuI6L0OT2Wlvs';

    // Check if Supabase SDK is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase SDK not loaded! Make sure to include the Supabase JS library.');
        return;
    }

    // Initialize Supabase Client
    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Export for global use
        window.supabaseClient = client;
        window.SUPABASE_URL = SUPABASE_URL;
        
        console.log('✅ Supabase client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
    }
})();
