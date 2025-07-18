import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
	return (
		<div className="min-h-screen bg-black text-white">
			{/* Netflix/Apple Style - Full Background Video Effect */}
			<div className="fixed inset-0 z-0">
				{/* Dynamic Mesh Gradient Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />
				
				{/* Animated Mesh Grid */}
				<div className="absolute inset-0 opacity-[0.03]">
					<motion.div
						className="w-full h-full"
						style={{
							backgroundImage: `
								radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%),
								radial-gradient(circle at 75% 75%, #f59e0b 0%, transparent 50%),
								linear-gradient(45deg, transparent 40%, rgba(251, 191, 36, 0.1) 50%, transparent 60%)
							`,
						}}
						animate={{
							backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
						}}
						transition={{
							duration: 20,
							repeat: Infinity,
							ease: "linear"
						}}
					/>
				</div>

				{/* Floating Orbs */}
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute rounded-full bg-gradient-to-r from-amber-400/10 to-yellow-500/10 blur-xl"
						style={{
							width: `${Math.random() * 300 + 100}px`,
							height: `${Math.random() * 300 + 100}px`,
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							x: [0, Math.random() * 100 - 50],
							y: [0, Math.random() * 100 - 50],
							scale: [1, 1.2, 1],
							opacity: [0.1, 0.3, 0.1],
						}}
						transition={{
							duration: Math.random() * 10 + 10,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				))}
			</div>

			{/* Content Layer */}
			<div className="relative z-10 min-h-screen flex">
				{/* Left: Minimal Brand (30%) */}
				<div className="w-full lg:w-2/5 flex flex-col justify-between p-8 lg:p-16">
					{/* Top: Logo */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
					>
						<div className="flex items-center space-x-3">
							<motion.div
								className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-2xl"
								whileHover={{ scale: 1.05, rotate: 3 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<Crown size={32} className="text-black" />
							</motion.div>
							<div>
								<h1 className="text-3xl font-black">
									<span className="text-white">Royal</span>
									<span className="text-amber-400">Cuts</span>
								</h1>
								<p className="text-amber-400/80 text-sm font-bold tracking-wider">
									LUXURY REDEFINED
								</p>
							</div>
						</div>
					</motion.div>

					{/* Center: Hero Text */}
					<motion.div
						className="flex-1 flex flex-col justify-center"
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
					>
						<h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
							<span className="block text-white">Where</span>
							<span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
								Excellence
							</span>
							<span className="block text-white">Meets Art</span>
						</h2>
						
						<p className="text-xl text-zinc-300 leading-relaxed max-w-md mb-8">
							Join the revolution in luxury grooming. Where every visit is an experience, 
							every cut is precision, every detail matters.
						</p>

						{/* Social Proof */}
						<div className="flex items-center space-x-6">
							<div className="flex items-center space-x-2">
								<div className="flex -space-x-2">
									{[1,2,3].map(i => (
										<div key={i} className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full border-2 border-black" />
									))}
								</div>
								<span className="text-sm text-zinc-400">2,500+ Elite Members</span>
							</div>
							<div className="flex items-center space-x-1">
								{[1,2,3,4,5].map(i => (
									<div key={i} className="w-4 h-4 bg-amber-400 rounded-full" />
								))}
								<span className="text-sm text-zinc-400 ml-2">Perfect Rating</span>
							</div>
						</div>
					</motion.div>

					{/* Bottom: Trust Badges */}
					<motion.div
						className="grid grid-cols-3 gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.8 }}
					>
						<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
							<div className="text-2xl font-black text-amber-400">24/7</div>
							<div className="text-xs text-zinc-400">Available</div>
						</div>
						<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
							<div className="text-2xl font-black text-amber-400">500+</div>
							<div className="text-xs text-zinc-400">Masters</div>
						</div>
						<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
							<div className="text-2xl font-black text-amber-400">∞</div>
							<div className="text-xs text-zinc-400">Possibilities</div>
						</div>
					</motion.div>
				</div>

				{/* Right: Premium Form (70%) */}
				<div className="hidden lg:flex w-3/5 items-center justify-center p-16">
					<motion.div
						className="w-full max-w-md"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
					>
						{/* Glass Morphism Card */}
						<div className="relative">
							{/* Glow Effect */}
							<div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-3xl blur-lg" />
							
							{/* Main Card */}
							<div className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
								{/* Form Header */}
								<motion.div
									className="text-center mb-8"
									initial={{ opacity: 0, y: -15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
								>
									<h3 className="text-2xl font-black text-white mb-2">{title}</h3>
									<p className="text-zinc-400">{subtitle}</p>
								</motion.div>

								{/* Form Content */}
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.8 }}
								>
									{children}
								</motion.div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Mobile Form Overlay */}
				<div className="lg:hidden fixed inset-0 z-20 flex items-end">
					<motion.div
						className="w-full bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-700 rounded-t-3xl p-6"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
					>
						<div className="text-center mb-6">
							<h3 className="text-xl font-black text-white mb-2">{title}</h3>
							<p className="text-zinc-400 text-sm">{subtitle}</p>
						</div>
						{children}
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
