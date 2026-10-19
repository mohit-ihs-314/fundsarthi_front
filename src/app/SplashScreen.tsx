import { motion } from "framer-motion";
import { FundsarthiLogo } from "./components/FundsarthiLogo";

export default function SplashScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-background">

      {/* 🌈 Animated Background Glow */}
      <motion.div
        className="absolute w-[300px] h-[300px] bg-primary/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🔥 Main Content */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        {/* ✨ Logo Animation */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <FundsarthiLogo size="lg" showTagline={true} />
        </motion.div>

        {/* ⚡ Premium Loader Bar */}
        <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* 💬 Tagline Fade */}
        <motion.p
          className="text-xs text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Preparing your experience...
        </motion.p>
      </motion.div>
    </div>
  );
}