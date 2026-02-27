# LLVM-SHIELD

obfuscator.cpp
 
g++ obfuscator.cpp -std=c++17 -O2 -o obfuscator
./obfuscator --cycles 3 --enable-string-encryption --enable-bogus --bogus-intensity 5 --seed 12345






DEOBFUSCATED.cpp

g++ DEOBFUSCATED.cpp -std=c++17 -O2 -o DEOBFUSCATED
g++ DEOBFUSCATED.cpp -std=c++17 -O2 -o DEOBFUSCATED.exe
./DEOBFUSCATED --cycles 3
