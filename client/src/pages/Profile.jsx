import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/80 border border-amber-400/20 rounded-2xl p-10 shadow-luxury backdrop-blur-xl text-center">
            <div className="flex flex-col items-center mb-8">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-2 border-amber-400 object-cover shadow-luxury mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-amber-400 text-black font-black flex items-center justify-center rounded-full text-3xl border-2 border-amber-400 shadow-luxury mb-4">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <h1 className="text-3xl font-black text-white font-display mb-1">
                {user?.name}
              </h1>
              <span className="text-amber-400 font-bold capitalize mb-2">
                {user?.role}
              </span>
            </div>
            <User className="mx-auto text-amber-400 mb-6" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">
              Profile Settings
            </h2>
            <p className="text-zinc-400 mb-4">
              This page is coming soon. You'll be able to manage your profile here.
            </p>
            {/* Add more profile settings here in future */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

//customer
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdlMTM0MGYxZTUwZWMxNTlmMzFjOWMiLCJpYXQiOjE3NTMwOTMzNjgsImV4cCI6MTc1MzY5ODE2OH0.t8WUMNatfvzoX5UxWOxP0dN8YKOn7PhZnWrd4fGdspk


//barber
//