import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { AuroraBackground } from "../ui/aurora-background";
import BottomGradient from "../ui/bottomGradient";
import Footer from "./Footer";
import { Input } from "../ui/input";
import nidData from "../../data/nid.json";
import Link from "next/link";

interface NidEntry {
  nid: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: {
    village_or_road: string;
    post_office: string;
    upazila: string;
    district: string;
    division: string;
  };
  issue_date: string;
  expiry_date: string;
  fingerprintHash: string;
}


function SignUpPage() {
  const [brideNid, setBrideNid] = useState("");
  const [groomNid, setGroomNid] = useState("");
  const [brideFingerprintScanned, setBrideFingerprintScanned] = useState(false);
  const [groomFingerprintScanned, setGroomFingerprintScanned] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycMessage, setKycMessage] = useState("");
  const [brideEntry, setBrideEntry] = useState<NidEntry | null>(null);
  const [groomEntry, setGroomEntry] = useState<NidEntry | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    const foundBrideNid = nidData.find((entry) => entry.nid === brideNid);
    const foundGroomNid = nidData.find((entry) => entry.nid === groomNid);

    if (
      foundBrideNid &&
      brideFingerprintScanned &&
      foundGroomNid &&
      groomFingerprintScanned
    ) {
      setKycVerified(true);
      setKycMessage("KYC Verified!");

      // Set the full entry objects in state
      setBrideEntry(foundBrideNid);
      setGroomEntry(foundGroomNid);

      // Prepare data to be sent
      const entry = {
        bride: foundBrideNid,
        groom: foundGroomNid,
      };

      // POST data to API route
      await fetch('/api/kyc-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: entry }),
      });

      // Navigate to the KYC success page with the entry objects in the query
      const entryString = JSON.stringify(entry);
      window.location.href = `/signUpMarriage/KYCsuccess/page?entry=${encodeURIComponent(entryString)}`;
    } else {
      setKycVerified(false);
      setKycMessage("KYC Verification Failed.");
    }
  };

  return (
    <main>
      <div>
        <AuroraBackground>
          <h1 className="relative mt-6 z-10 text-lg md:text-7xl sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 font-sans font-bold">
            Connect to Blockchain
          </h1>

          <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8 mt-10 mb-10 z-20 relative">
            <div className="max-w-md w-full mx-auto rounded-3xl md:rounded-3xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
              <div className="mt-6 font-extralight text-sm md:text-lg lg:text-xl dark:text-neutral-200 max-w-4xl">
                Bride NID
              </div>
              <Input
                type="text"
                placeholder="Enter bride's NID..."
                value={brideNid}
                onChange={(e) => setBrideNid(e.target.value)}
              />
              <div className="mt-6 font-extralight text-sm md:text-lg lg:text-xl dark:text-neutral-200 max-w-4xl">
                Bride Fingerprint
              </div>
              <div className="form-control items-center">
                <button
                  className="mt-6 py-1 px-1 border border-neutral-800 bg-gradient-to-br relative group/btn from-black dark:from-zinc dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-auto max-w-xs text-xxs text-white rounded-md h-auto font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                  onClick={() => setBrideFingerprintScanned(true)}
                >
                  Scan Fingerprint
                </button>

                <label className="label cursor-pointer">
                  <span className="dark:text-neutral-200">Scanned</span>
                  <input
                    type="checkbox"
                    checked={brideFingerprintScanned}
                    readOnly
                    className="checkbox"
                  />
                </label>
              </div>
              <div className="p-4 rounded-lg shadow-inner flex flex-col items-center">
                <Image
                  src="/images/finger.gif"
                  alt="Fingerprint"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="max-w-md w-full mx-auto rounded-3xl md:rounded-3xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
              <div className="mt-6 font-extralight text-sm md:text-lg lg:text-xl dark:text-neutral-200 max-w-4xl">
                Groom NID
              </div>
              <Input
                type="text"
                placeholder="Enter groom's NID..."
                value={groomNid}
                onChange={(e) => setGroomNid(e.target.value)}
              />
              <div className="mt-6 font-extralight text-sm md:text-lg lg:text-xl dark:text-neutral-200 max-w-4xl">
                Groom Fingerprint
              </div>
              <div className="form-control items-center">
                <button
                  className="mt-6 py-1 px-1 border border-neutral-800 bg-gradient-to-br relative group/btn from-black dark:from-zinc dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-auto max-w-xs text-xxs text-white rounded-md h-auto font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                  onClick={() => setGroomFingerprintScanned(true)}
                >
                  Scan Fingerprint
                </button>

                <label className="label cursor-pointer">
                  <span className="dark:text-neutral-200">Scanned</span>
                  <input
                    type="checkbox"
                    checked={groomFingerprintScanned}
                    readOnly
                    className="checkbox"
                  />
                </label>
              </div>
              <div className="p-4 rounded-lg shadow-inner flex flex-col items-center">
                <Image
                  src="/images/finger.gif"
                  alt="Fingerprint"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSignUp}
            className="mt-6 pd-5 py-2 px-12 border border-neutral-800 bg-gradient-to-br relative group/btn from-black dark:from-zinc dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-auto text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="button"
          >
            Verify
            <BottomGradient />
          </button>
          {kycMessage && (
            <div
              className={`mt-4 text-center font-medium py-2 px-12 ${kycVerified ? "text-green-500" : "text-red-500"
                }`}
            >
              {kycMessage}
            </div>
          )}
        </AuroraBackground>
      </div>
      <Footer />
    </main>
  );
}

export default SignUpPage;
