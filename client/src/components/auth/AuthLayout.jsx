import { motion } from 'framer-motion';
import { Scissors, Users, Award, Star } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex">
			{/* Left Side - Branding Section */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
				{/* Background Accents */}
				<div className="absolute top-20 left-20 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
				<div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl" />

				<div className="relative z-10 flex flex-col justify-center p-16 text-white">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, ease: 'easeOut' }}
					>
						{/* Logo */}
						<div className="flex items-center space-x-4 mb-12">
							<motion.div
								className="relative p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl"
								whileHover={{ scale: 1.05 }}
								transition={{ type: 'spring', stiffness: 300 }}
							>
								<Scissors size={32} className="text-white" />
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
							</motion.div>
							<div>
								<h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
									BarberShop
								</h1>
								<p className="text-amber-400/80 text-sm font-medium">
									Premium Grooming
								</p>
							</div>
						</div>

						{/* Heading */}
						<motion.h2
							className="text-5xl font-black mb-8 leading-tight"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<span className="bg-gradient-to-r from-white via-stone-100 to-amber-100 bg-clip-text text-transparent">
								Luxury Grooming
							</span>
							<br />
							<span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
								Redefined
							</span>
						</motion.h2>

						<motion.p
							className="text-xl text-stone-300 leading-relaxed mb-12 max-w-md"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							Experience the finest in men's grooming with our premium barbers and
							luxury amenities.
						</motion.p>

						{/* Stats */}
						<motion.div
							className="grid grid-cols-3 gap-8"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.6 }}
						>
							<div className="text-center group">
								<div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3 mx-auto group-hover:bg-white/20 transition-colors duration-300">
									<Users size={20} className="text-amber-400" />
								</div>
								<div className="text-2xl font-bold text-white">500+</div>
								<div className="text-sm text-stone-400">Happy Clients</div>
							</div>
							<div className="text-center group">
								<div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3 mx-auto group-hover:bg-white/20 transition-colors duration-300">
									<Award size={20} className="text-amber-400" />
								</div>
								<div className="text-2xl font-bold text-white">50+</div>
								<div className="text-sm text-stone-400">Master Barbers</div>
							</div>
							<div className="text-center group">
								<div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3 mx-auto group-hover:bg-white/20 transition-colors duration-300">
									<Star size={20} className="text-amber-400" />
								</div>
								<div className="text-2xl font-bold text-white">4.9</div>
								<div className="text-sm text-stone-400">Rating</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>

			{/* Right Side - Auth Form */}
			<div className="flex-1 flex items-center justify-center p-8 lg:p-16">
				<motion.div
					className="w-full max-w-md relative"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
				>
					{/* Decorative Circles */}
					<motion.div
						className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60"
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
					<motion.div
						className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-60"
						animate={{ scale: [1.2, 1, 1.2] }}
						transition={{ duration: 3, repeat: Infinity }}
					/>

					{/* Glass Styled Card */}
					<div className="relative">
						<div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
						<div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 rounded-3xl" />
						<div className="relative p-10">
							{/* Header */}
							<motion.div
								className="text-center mb-10"
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.1 }}
							>
								<h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
									{title}
								</h2>
								<p className="text-slate-600 text-lg">{subtitle}</p>
							</motion.div>

							{/* Form Content */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
							>
								{children}
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default AuthLayout;
