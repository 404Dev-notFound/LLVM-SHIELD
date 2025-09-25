import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Cpu, Gauge, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectPitch() {
  return (
    <div className="p-6 grid gap-6 text-center font-sans">
      {/* Title Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-2">
          <Shield className="w-10 h-10 text-blue-600" /> LLVM Shield
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Smart Object File Obfuscation using LLVM
        </p>
      </motion.div>

      {/* Problem Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-3">🔎 Problem</h2>
          <ul className="list-disc text-left ml-6 space-y-2">
            <li>Native binaries are easily reverse-engineered → IP theft & exploits.</li>
            <li>Existing tools: proprietary (expensive) or open-source (outdated/fragmented).</li>
            <li>Need for a modern, developer-friendly, LLVM-based obfuscation tool.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Solution Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-3">💡 Solution — LLVM Shield</h2>
          <ul className="list-disc text-left ml-6 space-y-2">
            <li>Obfuscates object files using LLVM passes.</li>
            <li>3 core transformations: Bogus Control Flow, Flattening, Instruction Substitution.</li>
            <li>One-click CLI & GUI with metrics dashboard.</li>
            <li>Ethical use: research, education, and IP protection.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Tech Stack Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
          <h2 className="col-span-5 text-2xl font-bold mb-3">⚙️ Tech Stack</h2>
          <div className="flex flex-col items-center">
            <Cpu className="w-8 h-8 text-indigo-500" />
            <p>LLVM/Clang</p>
          </div>
          <div className="flex flex-col items-center">
            <GitBranch className="w-8 h-8 text-green-500" />
            <p>LLVM Passes</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart3 className="w-8 h-8 text-red-500" />
            <p>Python/C++ CLI</p>
          </div>
          <div className="flex flex-col items-center">
            <Gauge className="w-8 h-8 text-yellow-500" />
            <p>React/Electron GUI</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 text-purple-500" />
            <p>Docker + CI/CD</p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Plan Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-3">🎥 Demo Plan</h2>
          <ol className="list-decimal text-left ml-6 space-y-2">
            <li>Compile small C program → object file.</li>
            <li>Run <code>llvm-shield</code> → apply obfuscation passes.</li>
            <li>Show before/after CFG visualization & disassembly.</li>
            <li>Highlight performance & size metrics on dashboard.</li>
          </ol>
        </CardContent>
      </Card>

      {/* Metrics Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-3">📊 Metrics</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-bold">Obfuscation Complexity</h3>
              <p>CFG nodes ↑, cyclomatic complexity ↑</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-bold">Performance Overhead</h3>
              <p>&lt; 15% runtime slowdown</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl">
              <h3 className="font-bold">Binary Size Growth</h3>
              <p>&lt;= 20%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Section */}
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-3">🌍 Impact</h2>
          <ul className="list-disc text-left ml-6 space-y-2">
            <li>Industry: protect proprietary software & IP.</li>
            <li>Academia: teaching & research into obfuscation.</li>
            <li>Developers: free, open, reproducible alternative to costly tools.</li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button className="mt-6 px-6 py-4 text-lg rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700">
          🚀 LLVM Shield — Obfuscation Simplified
        </Button>
      </motion.div>
    </div>
  );
}
