import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
	return (
		<div className="h-screen bg-black text-white overflow-hidden">
			{/* Single Screen Layout */}
			<div className="h-full relative">
				{/* Animated Background */}
				<div className="absolute inset-0">
					<div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

					{/* Dynamic Grid */}
					<div className="absolute inset-0 opacity-10">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: `
                     linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                   `,
								backgroundSize: '50px 50px',
							}}
						/>
					</div>

					{/* Floating Particles */}
					{[...Array(12)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [-15, 15, -15],
								opacity: [0, 0.8, 0],
								scale: [0, 1, 0],
							}}
							transition={{
								duration: Math.random() * 4 + 3,
								repeat: Infinity,
								delay: Math.random() * 2,
							}}
						/>
					))}
				</div>

				{/* Content Container */}
				<div className="relative z-10 h-full flex items-center">
					<div className="w-full max-w-7xl mx-auto px-6">
						<div className="grid lg:grid-cols-2 gap-16 items-center">
							{/* Left Side - Brand */}
							<motion.div
								initial={{ opacity: 0, x: -100 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
								className="text-left"
							>
								{/* Logo */}
								<motion.div
									className="flex items-center space-x-4 mb-12"
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.3 }}
								>
									<motion.div
										className="relative p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl"
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{ type: 'spring', stiffness: 300 }}
									>
										<Crown size={32} className="text-black" />
										<motion.div
											className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
											animate={{ scale: [1, 1.5, 1] }}
											transition={{ duration: 2, repeat: Infinity }}
										/>
									</motion.div>
									<div>
										<h1 className="text-2xl font-black">
											<span className="text-white">Royal</span>
											<span className="text-amber-400">Cuts</span>
										</h1>
										<p className="text-amber-400/80 text-xs font-bold tracking-widest">
											PREMIUM GROOMING
										</p>
									</div>
								</motion.div>

								{/* Main Headline */}
								<motion.div
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 1, delay: 0.5 }}
								>
									<h2 className="text-7xl font-black mb-8 leading-none">
										<span className="block text-white">Where</span>
										<span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
											Masters
										</span>
										<span className="block text-white">Create</span>
									</h2>

									<p className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-lg">
										Step into the future of luxury grooming. Where every cut is a
										masterpiece, every detail perfected, every experience
										extraordinary.
									</p>
								</motion.div>

								{/* Features */}
								<motion.div
									className="grid grid-cols-3 gap-8"
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.8 }}
								>
									<div className="text-center">
										<div className="text-3xl font-black text-amber-400 mb-2">
											24/7
										</div>
										<div className="text-sm text-zinc-400">Available</div>
									</div>
									<div className="text-center">
										<div className="text-3xl font-black text-amber-400 mb-2">
											500+
										</div>
										<div className="text-sm text-zinc-400">Masters</div>
									</div>
									<div className="text-center">
										<div className="text-3xl font-black text-amber-400 mb-2">
											5.0★
										</div>
										<div className="text-sm text-zinc-400">Rating</div>
									</div>
								</motion.div>
							</motion.div>

							{/* Right Side - Form */}
							<motion.div
								initial={{ opacity: 0, x: 100 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									duration: 1.2,
									ease: [0.16, 1, 0.3, 1],
									delay: 0.2,
								}}
								className="relative"
							>
								{/* Glow Effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-3xl blur-3xl" />

								{/* Form Container */}
								<div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-12 shadow-2xl">
									{/* Form Header */}
									<motion.div
										className="text-center mb-10"
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.4 }}
									>
										<h3 className="text-2xl font-black text-white mb-3">{title}</h3>
										<p className="text-zinc-400">{subtitle}</p>
									</motion.div>

									{/* Form Content */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.6 }}
									>
										{children}
									</motion.div>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
	