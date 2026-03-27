"use client";

import Image from "next/image";
import { brand } from "@funberry/config";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { type: "spring" as const, stiffness: 200, damping: 20 },
};

export default function HomeContent() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-6 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-berry-50/30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🍓", "⭐", "🎮", "📚", "🌈", "🎯", "🌸", "🦋"].map((e, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${8 + i * 12}%`,
                top: `${10 + (i % 3) * 25}%`,
                opacity: 0.12,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4 + i * 0.5,
                delay: i * 0.3,
              }}
            >
              {e}
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="mb-6"
          >
            <motion.div
              className="inline-block"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Image src="/logo.png" alt="FunBerry Kids" width={200} height={120} className="drop-shadow-lg" priority />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-6xl font-bold tracking-tight sm:text-8xl"
            style={{
              background: "linear-gradient(135deg, #1c498c, #379df9, #ff2d6a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {brand.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 font-body"
          >
            {brand.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-kid px-10 py-5 text-lg font-bold text-white shadow-kid-lg"
              style={{
                background: "linear-gradient(135deg, #ff2d6a, #f20d55)",
                boxShadow: "0 8px 30px rgba(255,45,106,0.3)",
              }}
            >
              Get Started Free
            </motion.a>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-kid border-2 border-sky-300 bg-white px-10 py-5 text-lg font-bold text-sky-700 shadow-kid"
            >
              Parent Login
            </motion.a>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.h2 {...fadeUp} className="font-display text-center text-3xl font-bold text-sky-900 sm:text-4xl">
            Explore Fun Learning Zones
          </motion.h2>
          <motion.p {...fadeUp} className="mx-auto mt-3 max-w-2xl text-center text-gray-500">
            Aligned with the ICSE Class 2 syllabus. Each zone is a mini adventure packed with games!
          </motion.p>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { emoji: "🌱", name: "Plants", color: "from-leaf-50 to-leaf-100 text-leaf-700" },
              { emoji: "🐾", name: "Animals", color: "from-sunshine-50 to-sunshine-100 text-sunshine-700" },
              { emoji: "🚗", name: "Transport", color: "from-sky-50 to-sky-100 text-sky-700" },
              { emoji: "💧", name: "Water", color: "from-sky-100 to-cyan-100 text-sky-800" },
              { emoji: "🍎", name: "Food", color: "from-berry-50 to-berry-100 text-berry-700" },
              { emoji: "🏠", name: "Shelter", color: "from-sunshine-50 to-sunshine-100 text-sunshine-700" },
              { emoji: "⭐", name: "Space", color: "from-purple-50 to-purple-100 text-purple-700" },
              { emoji: "🕐", name: "Time", color: "from-leaf-50 to-leaf-100 text-leaf-700" },
              { emoji: "👋", name: "About Me", color: "from-berry-50 to-berry-100 text-berry-700" },
              { emoji: "🌍", name: "& More!", color: "from-sky-50 to-sky-100 text-sky-700" },
            ].map((zone, i) => (
              <motion.div
                key={zone.name}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 18 }}
                whileHover={{ scale: 1.08, y: -5 }}
                className={`flex flex-col items-center rounded-kid p-6 bg-gradient-to-br ${zone.color} shadow-kid cursor-default`}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: i * 0.3 }}
                >
                  {zone.emoji}
                </motion.span>
                <span className="mt-2 font-display font-semibold">{zone.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-sky-50 to-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.h2 {...fadeUp} className="font-display text-center text-3xl font-bold text-sky-900 sm:text-4xl">
            8 Types of Fun Games
          </motion.h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎯", title: "Drag & Sort", desc: "Sort items into the right buckets", color: "#10b981" },
              { icon: "🃏", title: "Memory Match", desc: "Flip cards and find matching pairs", color: "#ec4899" },
              { icon: "❓", title: "Picture Quiz", desc: "Pick the right answer from pictures", color: "#379df9" },
              { icon: "📋", title: "Sequence", desc: "Arrange steps in the right order", color: "#f59e0b" },
              { icon: "🔍", title: "Spot Difference", desc: "Find what changed between scenes", color: "#8b5cf6" },
              { icon: "🎨", title: "Color Activity", desc: "Paint the picture with correct colors", color: "#f97316" },
              { icon: "🔗", title: "Word-Picture", desc: "Connect words to matching images", color: "#22c55e" },
              { icon: "📖", title: "Story Time", desc: "Interactive stories with choices", color: "#ec4899" },
            ].map((game, i) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 18 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="rounded-kid bg-white p-6 shadow-kid"
                style={{ borderTop: `4px solid ${game.color}` }}
              >
                <motion.span
                  className="text-4xl inline-block"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
                >
                  {game.icon}
                </motion.span>
                <h3 className="mt-3 font-display text-lg font-bold text-sky-900">{game.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{game.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2 {...fadeUp} className="font-display text-center text-3xl font-bold text-sky-900 sm:text-4xl">
            Simple Pricing
          </motion.h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="rounded-kid border-2 border-gray-200 p-8 shadow-kid"
            >
              <h3 className="font-display text-2xl font-bold text-gray-900">Free</h3>
              <p className="mt-2 text-4xl font-bold text-gray-900">$0</p>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li>&#10003; 3 Learning Zones</li>
                <li>&#10003; 2 Games per Zone</li>
                <li>&#10003; Basic Progress Tracking</li>
                <li>&#10003; 1 Child Profile</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="rounded-kid p-8 relative shadow-kid-lg"
              style={{
                background: "linear-gradient(135deg, #fff0f3, #ffe0e8)",
                border: "2px solid #ffc6d6",
              }}
            >
              <span className="absolute -top-3 right-6 rounded-full bg-berry-500 px-4 py-1 text-xs font-bold text-white shadow-kid-glow-berry">
                BEST VALUE
              </span>
              <h3 className="font-display text-2xl font-bold text-berry-900">Premium</h3>
              <p className="mt-2 text-4xl font-bold text-berry-900">
                $4.99
                <span className="text-base font-normal text-berry-600">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-berry-800">
                <li>&#10003; All 15 Learning Zones</li>
                <li>&#10003; All Games Unlocked</li>
                <li>&#10003; Detailed Progress Reports</li>
                <li>&#10003; Up to 4 Child Profiles</li>
                <li>&#10003; Play Timer for Parents</li>
                <li>&#10003; No Ads</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-sky-900 px-6 py-12 text-sky-200">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Image src="/logo.png" alt="FunBerry Kids" width={80} height={48} className="mx-auto brightness-0 invert" />
          </motion.div>
          <p className="mt-2 font-display text-lg font-bold text-white">{brand.name}</p>
          <p className="mt-1 text-sm text-sky-300">{brand.tagline}</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="/privacy" className="text-sky-300 hover:text-white transition">Privacy</a>
            <a href="/terms" className="text-sky-300 hover:text-white transition">Terms</a>
          </div>
          <p className="mt-6 text-xs text-sky-400">
            &copy; {new Date().getFullYear()} {brand.name}. Made with love for little learners.
          </p>
        </div>
      </footer>
    </main>
  );
}
