import React, { useState, useEffect } from 'react'

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set target time 2 jam dari sekarang
    const targetTime = new Date()
    targetTime.setHours(targetTime.getHours() + 2)

    const timer = setInterval(() => {
      const now = new Date()
      const difference = targetTime - now

      if (difference <= 0) {
        clearInterval(timer)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .maintenance-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(180deg, #006994 0%, #004d7a 30%, #003d5c 60%, #002a45 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Ocean Background with Waves */
        .ocean-background {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: -50%;
          width: 200%;
          height: 100px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: waveMove 8s infinite linear;
        }

        .wave1 {
          bottom: -20px;
          height: 120px;
          background: rgba(255, 255, 255, 0.03);
          animation-duration: 8s;
        }

        .wave2 {
          bottom: -10px;
          height: 100px;
          background: rgba(255, 255, 255, 0.05);
          animation-duration: 12s;
          animation-delay: -2s;
        }

        .wave3 {
          bottom: 0px;
          height: 80px;
          background: rgba(255, 255, 255, 0.08);
          animation-duration: 15s;
          animation-delay: -4s;
        }

        @keyframes waveMove {
          0% {
            transform: translateX(0) scaleY(1);
          }
          50% {
            transform: translateX(25%) scaleY(0.8);
          }
          100% {
            transform: translateX(50%) scaleY(1);
          }
        }

        /* Bubbles */
        .bubbles {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .bubble {
          position: absolute;
          width: 15px;
          height: 15px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1));
          border-radius: 50%;
          animation: bubbleFloat 12s infinite ease-in;
        }

        .bubble:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
          animation-duration: 14s;
        }

        .bubble:nth-child(2) {
          left: 20%;
          animation-delay: 1s;
          animation-duration: 16s;
          width: 20px;
          height: 20px;
        }

        .bubble:nth-child(3) {
          left: 30%;
          animation-delay: 2s;
          animation-duration: 12s;
        }

        .bubble:nth-child(4) {
          left: 40%;
          animation-delay: 0.5s;
          animation-duration: 18s;
          width: 25px;
          height: 25px;
        }

        .bubble:nth-child(5) {
          left: 50%;
          animation-delay: 3s;
          animation-duration: 15s;
        }

        .bubble:nth-child(6) {
          left: 60%;
          animation-delay: 1.5s;
          animation-duration: 13s;
          width: 18px;
          height: 18px;
        }

        .bubble:nth-child(7) {
          left: 70%;
          animation-delay: 2.5s;
          animation-duration: 17s;
        }

        .bubble:nth-child(8) {
          left: 80%;
          animation-delay: 0.8s;
          animation-duration: 14s;
          width: 22px;
          height: 22px;
        }

        .bubble:nth-child(9) {
          left: 90%;
          animation-delay: 3.5s;
          animation-duration: 16s;
        }

        .bubble:nth-child(10) {
          left: 95%;
          animation-delay: 1.2s;
          animation-duration: 11s;
        }

        @keyframes bubbleFloat {
          0% {
            bottom: -10%;
            opacity: 0;
            transform: translateX(0) scale(0.5);
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            bottom: 110%;
            opacity: 0;
            transform: translateX(50px) scale(1.5);
          }
        }

        /* Sea Creatures */
        .sea-creatures {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        /* Fish */
        .fish {
          position: absolute;
          animation: fishSwim 20s infinite linear;
        }

        .fish-body {
          position: relative;
          width: 60px;
          height: 30px;
          background: linear-gradient(90deg, #ff6b6b, #ff5252);
          border-radius: 50%;
          transform: rotate(0deg);
        }

        .fish-eye {
          position: absolute;
          top: 8px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        .fish-eye::after {
          content: '';
          position: absolute;
          top: 2px;
          right: 2px;
          width: 4px;
          height: 4px;
          background: #333;
          border-radius: 50%;
        }

        .fish-tail {
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 20px;
          background: inherit;
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        .fish1 {
          top: 20%;
          left: -10%;
          animation-delay: 0s;
        }

        .fish2 {
          top: 40%;
          left: -20%;
          animation-delay: -5s;
          animation-duration: 25s;
        }

        .fish2 .fish-body {
          background: linear-gradient(90deg, #ffd93d, #f6b93b);
          transform: scaleX(-1);
        }

        .fish3 {
          top: 60%;
          left: -15%;
          animation-delay: -10s;
          animation-duration: 18s;
        }

        .fish3 .fish-body {
          background: linear-gradient(90deg, #a8e6cf, #88d8b0);
        }

        @keyframes fishSwim {
          0% {
            transform: translateX(0) translateY(0) scaleX(1);
          }
          25% {
            transform: translateX(30vw) translateY(-30px) scaleX(1);
          }
          50% {
            transform: translateX(60vw) translateY(20px) scaleX(1);
          }
          75% {
            transform: translateX(90vw) translateY(-20px) scaleX(1);
          }
          100% {
            transform: translateX(120vw) translateY(10px) scaleX(1);
          }
        }

        /* Jellyfish */
        .jellyfish {
          position: absolute;
          top: 15%;
          right: 10%;
          animation: jellyfishFloat 6s infinite ease-in-out;
        }

        .jellyfish-body {
          position: relative;
          width: 80px;
          height: 100px;
        }

        .jellyfish-head {
          width: 80px;
          height: 60px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 105, 180, 0.8), rgba(255, 20, 147, 0.6));
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(255, 105, 180, 0.3);
          animation: jellyfishPulse 2s infinite ease-in-out;
        }

        .tentacle {
          position: absolute;
          top: 50px;
          width: 3px;
          height: 50px;
          background: linear-gradient(180deg, rgba(255, 20, 147, 0.6), rgba(255, 20, 147, 0.1));
          transform-origin: top center;
          animation: tentacleWave 2s infinite ease-in-out;
        }

        .t1 { left: 15px; animation-delay: 0s; }
        .t2 { left: 30px; animation-delay: 0.3s; }
        .t3 { left: 45px; animation-delay: 0.6s; }
        .t4 { left: 60px; animation-delay: 0.9s; }

        @keyframes jellyfishFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(5deg);
          }
        }

        @keyframes jellyfishPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes tentacleWave {
          0%, 100% {
            transform: rotate(0deg) scaleY(1);
          }
          50% {
            transform: rotate(20deg) scaleY(1.2);
          }
        }

        /* Turtle */
        .turtle {
          position: absolute;
          bottom: 20%;
          left: 5%;
          animation: turtleSwim 15s infinite ease-in-out;
        }

        .turtle-body {
          position: relative;
          width: 120px;
          height: 80px;
        }

        .turtle-shell {
          width: 100px;
          height: 70px;
          background: radial-gradient(circle at 30% 30%, #2d7d46, #1a5c32);
          border-radius: 50%;
          border: 3px solid #3a9d5a;
          position: relative;
          box-shadow: 0 0 20px rgba(45, 125, 70, 0.3);
        }

        .turtle-shell::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60%;
          height: 60%;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .turtle-head {
          position: absolute;
          left: -30px;
          top: 20px;
          width: 35px;
          height: 25px;
          background: #2d7d46;
          border-radius: 50%;
        }

        .turtle-eye {
          position: absolute;
          left: -15px;
          top: 28px;
          width: 6px;
          height: 6px;
          background: black;
          border-radius: 50%;
        }

        .turtle-flipper {
          position: absolute;
          width: 20px;
          height: 40px;
          background: #2d7d46;
          border-radius: 50%;
          animation: flipperMove 2s infinite ease-in-out;
        }

        .flipper1 {
          bottom: -10px;
          left: 10px;
          transform: rotate(-30deg);
          animation-delay: 0s;
        }

        .flipper2 {
          bottom: -10px;
          right: 10px;
          transform: rotate(30deg);
          animation-delay: 0.3s;
        }

        @keyframes turtleSwim {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(20vw) translateY(-20px);
          }
          50% {
            transform: translateX(40vw) translateY(10px);
          }
          75% {
            transform: translateX(60vw) translateY(-15px);
          }
        }

        @keyframes flipperMove {
          0%, 100% {
            transform: rotate(-30deg) scaleY(1);
          }
          50% {
            transform: rotate(-10deg) scaleY(0.8);
          }
        }

        /* Starfish */
        .starfish {
          position: absolute;
          top: 50%;
          right: 5%;
          animation: starfishSpin 20s infinite linear;
        }

        .starfish-body {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .arm {
          position: absolute;
          width: 20px;
          height: 30px;
          background: #ff6b35;
          border-radius: 50%;
          transform-origin: center bottom;
        }

        .arm1 { top: -10px; left: 50%; transform: translateX(-50%) rotate(0deg); }
        .arm2 { top: 20px; right: -20px; transform: rotate(72deg); }
        .arm3 { bottom: -10px; right: 5px; transform: rotate(144deg); }
        .arm4 { bottom: -10px; left: 5px; transform: rotate(216deg); }
        .arm5 { top: 20px; left: -20px; transform: rotate(288deg); }

        @keyframes starfishSpin {
          0% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.05);
          }
          50% {
            transform: rotate(180deg) scale(0.95);
          }
          75% {
            transform: rotate(270deg) scale(1.05);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        /* Whale */
        .whale {
          position: absolute;
          top: 70%;
          right: -100px;
          animation: whaleSwim 30s infinite linear;
        }

        .whale-body {
          position: relative;
          width: 150px;
          height: 60px;
          background: linear-gradient(180deg, #4a90d9, #2c6faa);
          border-radius: 50%;
        }

        .whale-eye {
          position: absolute;
          top: 20px;
          left: 30px;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        }

        .whale-eye::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 5px;
          height: 5px;
          background: #333;
          border-radius: 50%;
        }

        .whale-tail {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: inherit;
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        .whale-fin {
          position: absolute;
          top: -20px;
          right: 40px;
          width: 30px;
          height: 30px;
          background: inherit;
          clip-path: polygon(0 0, 100% 100%, 0 100%);
        }

        @keyframes whaleSwim {
          0% {
            transform: translateX(0) translateY(0) scaleX(-1);
          }
          25% {
            transform: translateX(-20vw) translateY(-30px) scaleX(-1);
          }
          50% {
            transform: translateX(-40vw) translateY(20px) scaleX(-1);
          }
          75% {
            transform: translateX(-60vw) translateY(-20px) scaleX(-1);
          }
          100% {
            transform: translateX(-80vw) translateY(10px) scaleX(-1);
          }
        }

        /* Main Content */
        .main-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }

        .content-wrapper {
          max-width: 800px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          padding: 50px 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: contentFloat 4s infinite ease-in-out;
        }

        @keyframes contentFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .main-title {
          font-size: 3rem;
          color: white;
          margin-bottom: 20px;
          text-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          animation: titleGlow 3s infinite ease-in-out;
        }

        .title-wave {
          display: inline-block;
          animation: emojiWave 2s infinite ease-in-out;
        }

        .title-wave:last-child {
          animation-delay: 0.3s;
        }

        @keyframes titleGlow {
          0%, 100% {
            text-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          }
          50% {
            text-shadow: 0 5px 40px rgba(255, 255, 255, 0.2), 0 0 60px rgba(100, 200, 255, 0.1);
          }
        }

        @keyframes emojiWave {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        .subtitle-container {
          margin-bottom: 30px;
        }

        .subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        /* Countdown Timer */
        .countdown-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
        }

        .countdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 15px 25px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 80px;
        }

        .countdown-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #4facfe;
          text-shadow: 0 0 30px rgba(79, 172, 254, 0.3);
          animation: numberPulse 1s infinite ease-in-out;
        }

        .countdown-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .countdown-separator {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          animation: separatorBlink 1s infinite;
        }

        @keyframes numberPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes separatorBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .status-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
          margin: 30px 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-item {
          margin-bottom: 20px;
          text-align: left;
          color: white;
        }

        .status-item:last-child {
          margin-bottom: 0;
        }

        .status-icon {
          margin-right: 10px;
          font-size: 1.2rem;
        }

        .status-bar {
          margin-top: 8px;
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .status-progress {
          height: 100%;
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          border-radius: 10px;
          animation: progressPulse 2s infinite ease-in-out;
        }

        @keyframes progressPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .contact-info {
          margin: 30px 0;
        }

        .contact-text {
          color: rgba(255, 255, 255, 0.8);
          margin: 10px 0;
          font-size: 1rem;
        }

        .highlight {
          color: #4facfe;
          font-weight: bold;
          text-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .social-icon {
          display: inline-block;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          font-size: 1.5rem;
          text-decoration: none;
          line-height: 50px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-icon:hover {
          transform: translateY(-5px) scale(1.1);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        /* Caustics Effect */
        .caustics {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .caustic {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent);
          animation: causticMove 20s infinite linear;
        }

        .c1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: 20%;
          animation-duration: 25s;
        }

        .c2 {
          width: 400px;
          height: 400px;
          bottom: 20%;
          right: 10%;
          animation-duration: 30s;
          animation-delay: -10s;
        }

        .c3 {
          width: 200px;
          height: 200px;
          top: 40%;
          left: 60%;
          animation-duration: 20s;
          animation-delay: -5s;
        }

        @keyframes causticMove {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(50px, -30px) scale(1.2);
            opacity: 0.5;
          }
          50% {
            transform: translate(-20px, 50px) scale(0.8);
            opacity: 0.3;
          }
          75% {
            transform: translate(30px, -20px) scale(1.1);
            opacity: 0.6;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-title {
            font-size: 2rem;
          }
          
          .content-wrapper {
            padding: 30px 20px;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .status-card {
            padding: 20px;
          }

          .countdown-container {
            gap: 10px;
          }

          .countdown-item {
            padding: 10px 15px;
            min-width: 60px;
          }

          .countdown-number {
            font-size: 1.8rem;
          }

          .countdown-separator {
            font-size: 1.8rem;
          }
          
          .whale {
            display: none;
          }
          
          .turtle {
            display: none;
          }
          
          .starfish {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 1.5rem;
          }
          
          .content-wrapper {
            padding: 20px 15px;
          }

          .countdown-item {
            padding: 8px 10px;
            min-width: 50px;
          }

          .countdown-number {
            font-size: 1.5rem;
          }

          .countdown-separator {
            font-size: 1.5rem;
          }
          
          .fish {
            display: none;
          }
          
          .jellyfish {
            display: none;
          }
        }
      `}</style>

      <div className="maintenance-container">
        {/* Background dengan gradasi laut */}
        <div className="ocean-background">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        {/* Gelembung udara */}
        <div className="bubbles">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>

        {/* Hewan Laut */}
        <div className="sea-creatures">
          {/* Ikan Kecil */}
          <div className="fish fish1">
            <div className="fish-body">
              <div className="fish-eye"></div>
              <div className="fish-tail"></div>
            </div>
          </div>

          <div className="fish fish2">
            <div className="fish-body">
              <div className="fish-eye"></div>
              <div className="fish-tail"></div>
            </div>
          </div>

          <div className="fish fish3">
            <div className="fish-body">
              <div className="fish-eye"></div>
              <div className="fish-tail"></div>
            </div>
          </div>

          {/* Ubur-ubur */}
          <div className="jellyfish">
            <div className="jellyfish-body">
              <div className="jellyfish-head"></div>
              <div className="tentacle t1"></div>
              <div className="tentacle t2"></div>
              <div className="tentacle t3"></div>
              <div className="tentacle t4"></div>
            </div>
          </div>

          {/* Penyu */}
          <div className="turtle">
            <div className="turtle-body">
              <div className="turtle-shell"></div>
              <div className="turtle-head"></div>
              <div className="turtle-eye"></div>
              <div className="turtle-flipper flipper1"></div>
              <div className="turtle-flipper flipper2"></div>
            </div>
          </div>

          {/* Bintang Laut */}
          <div className="starfish">
            <div className="starfish-body">
              <div className="arm arm1"></div>
              <div className="arm arm2"></div>
              <div className="arm arm3"></div>
              <div className="arm arm4"></div>
              <div className="arm arm5"></div>
            </div>
          </div>

          {/* Ikan Paus */}
          <div className="whale">
            <div className="whale-body">
              <div className="whale-eye"></div>
              <div className="whale-tail"></div>
              <div className="whale-fin"></div>
            </div>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="main-content">
          <div className="content-wrapper">
            <h1 className="main-title">
              <span className="title-wave">🐠</span>
              Sedang Dalam Perbaikan
              <span className="title-wave">🐠</span>
            </h1>
            
            <div className="subtitle-container">
              <p className="subtitle">
                Kami sedang menyelam dalam perbaikan untuk memberikan pengalaman yang lebih baik
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="countdown-container">
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="countdown-label">Jam</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="countdown-label">Menit</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="countdown-label">Detik</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-item">
                <span className="status-icon">🔧</span>
                <span>Perbaikan Sistem</span>
                <div className="status-bar">
                  <div className="status-progress" style={{width: '75%'}}></div>
                </div>
              </div>
              <div className="status-item">
                <span className="status-icon">⚡</span>
                <span>Peningkatan Performa</span>
                <div className="status-bar">
                  <div className="status-progress" style={{width: '60%'}}></div>
                </div>
              </div>
              <div className="status-item">
                <span className="status-icon">🎨</span>
                <span>Desain Ulang</span>
                <div className="status-bar">
                  <div className="status-progress" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <p className="contact-text">
               
              </p>
              <p className="contact-text">
                Untuk info lebih lanjut, hubungi: <span className="highlight">fika aja gin</span>
              </p>
            </div>

            <div className="social-links">
              <a href="#" className="social-icon">🐦</a>
              <a href="#" className="social-icon">📱</a>
              <a href="#" className="social-icon">💬</a>
              <a href="#" className="social-icon">📧</a>
            </div>
          </div>
        </div>

        {/* Efek Cahaya Bawah Air */}
        <div className="caustics">
          <div className="caustic c1"></div>
          <div className="caustic c2"></div>
          <div className="caustic c3"></div>
        </div>
      </div>
    </>
  )
}

export default Maintenance