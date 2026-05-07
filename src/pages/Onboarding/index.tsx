import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Wallet, X } from "lucide-react";
import Hyperspeed from "@/components/reactbits/Hyperspeed/Hyperspeed";
import BlurText from "@/components/reactbits/BlurText/BlurText";
import SplitText from "@/components/reactbits/SplitText/SplitText";
import BorderGlow from "@/components/reactbits/BorderGlow/BorderGlow";
import { CreateWallet } from "./CreateWallet";
import { ConfirmSeed } from "./ConfirmSeed";
import { SetPassword } from "./SetPassword";
import ImportChoice from "./Import";
import SeedPhraseImport from "./Import/SeedPhrase";
import PrivateKeyImport from "./Import/PrivateKey";
import KeystoreImport from "./Import/Keystore";

// ─── Create-wallet sub-flow (step state, no sub-routes) ─────────────────────

type CreateStep = "create" | "confirm" | "password";

function CreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<CreateStep>("create");
  const [mnemonic, setMnemonic] = useState("");

  if (step === "create") {
    return (
      <CreateWallet
        onNext={(m) => {
          setMnemonic(m);
          setStep("confirm");
        }}
      />
    );
  }
  if (step === "confirm") {
    return (
      <ConfirmSeed
        mnemonic={mnemonic}
        onNext={() => setStep("password")}
        onBack={() => setStep("create")}
      />
    );
  }
  return (
    <SetPassword
      mnemonic={mnemonic}
      onBack={() => setStep("confirm")}
      onDone={onDone}
    />
  );
}

function CreateFlowRoute() {
  const navigate = useNavigate();
  return <CreateFlow onDone={() => navigate("/")} />;
}

// ─── Modal overlay ───────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d16]/95 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Landing page ────────────────────────────────────────────────────────────

function OnboardingLanding() {
  const navigate = useNavigate();
  const [titleDone, setTitleDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-[#0a0a0f] text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Hyperspeed highway */}
        <div className="absolute inset-0 z-0">
          <Hyperspeed
            effectOptions={{
              distortion: "turbulentDistortion",
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 3,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 20,
              lightPairsPerRoadWay: 40,
              colors: {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0xffffff,
                brokenLines: 0xffffff,
                leftCars: [0x3b82f6, 0x6366f1, 0x8b5cf6],
                rightCars: [0x06b6d4, 0x0ea5e9, 0x38bdf8],
                sticks: 0x60a5fa,
              },
            }}
          />
        </div>

        {/* Header */}
        <header className="absolute inset-x-0 top-6 z-[2] flex justify-center px-6">
          <div className="flex w-full max-w-[80%] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-blue-600/20 p-1.5">
                <Wallet className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-white">Konoha</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="text-sm text-white/50 transition-colors hover:text-white/90"
                onClick={() => navigate("/onboarding/import")}
              >
                Import Wallet
              </button>
              <button
                className="rounded-xl bg-blue-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-blue-500"
                onClick={() => navigate("/onboarding/create")}
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-6">

          <div className="rounded-[2.5rem] border border-white/20 p-6">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 px-10 py-12 text-center shadow-2xl backdrop-blur-xl">

            <div className="animate-logo-pulse rounded-2xl border border-blue-500/20 bg-blue-600/10 p-5 backdrop-blur-sm">
              <Wallet className="h-12 w-12 text-blue-400" />
            </div>

            <SplitText
              text="Konoha"
              tag="h1"
              className="text-[5rem] font-bold leading-none tracking-tight text-white md:text-[7rem]"
              delay={55}
              duration={1.0}
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 1, y: 0 }}
              onLetterAnimationComplete={() => setTitleDone(true)}
            />

            <div
              style={{
                opacity: titleDone ? 1 : 0,
                transform: titleDone ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <BlurText
                text="A secure, non-custodial wallet for Ethereum and EVM-compatible networks"
                className="max-w-lg text-lg text-blue-100/55 md:text-xl"
                delay={75}
                animateBy="words"
              />
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <BorderGlow
                borderRadius={12}
                backgroundColor="transparent"
                colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                glowColor="217 91 60"
                glowIntensity={1.3}
                glowRadius={48}
                animated
              >
                <button
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-500"
                  onClick={() => navigate("/onboarding/create")}
                >
                  Create New Wallet
                </button>
              </BorderGlow>

              <button
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-blue-200/75 backdrop-blur-sm transition-colors hover:bg-white/10"
                onClick={() => navigate("/onboarding/import")}
              >
                Import Wallet
              </button>
            </div>

            <p className="text-sm text-white/35">
              🔒 Your keys, your crypto. No accounts. No tracking.
            </p>

          </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center">
        <p className="text-sm text-white/25">
          Konoha Wallet · Open Source · Not financial advice
        </p>
      </footer>
    </div>
  );
}

// ─── Layout: landing always in background, sub-routes open as modal ──────────

function OnboardingLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isModal = pathname !== "/onboarding" && pathname !== "/onboarding/";

  return (
    <>
      <OnboardingLanding />
      {isModal && (
        <ModalOverlay onClose={() => navigate("/onboarding")}>
          <Outlet />
        </ModalOverlay>
      )}
    </>
  );
}

// ─── Root export: handles /onboarding/* sub-routes ───────────────────────────

export default function Onboarding() {
  return (
    <Routes>
      <Route element={<OnboardingLayout />}>
        <Route index element={null} />
        <Route path="create" element={<CreateFlowRoute />} />
        <Route path="import" element={<ImportChoice />} />
        <Route path="import/seed-phrase" element={<SeedPhraseImport />} />
        <Route path="import/private-key" element={<PrivateKeyImport />} />
        <Route path="import/keystore" element={<KeystoreImport />} />
      </Route>
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
