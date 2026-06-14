import { useState, useEffect } from "react";
import Bestsellers from "./components/Bestsellers";
import PoliciesPage from './components/Policies';

const POLICY_HASHES = [
  "#authenticity",
  "#about",
  "#shipping",
  "#returns",
  "#terms",
  "#privacy",
];

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isPolicyPage = POLICY_HASHES.includes(hash);

  return (
    <div className="flex flex-col gap-0">
      {!isPolicyPage && <Bestsellers />}
      <PoliciesPage />
    </div>
  );
}

export default App;
