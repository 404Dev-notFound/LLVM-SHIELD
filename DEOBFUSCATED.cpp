#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

/* ==============================
        Config
=================================*/
struct DeobfuscationConfig {
    int cycles = 1;
};

/* ==============================
        Utility Functions
=================================*/

// Remove bogus noise like [randomStuff]
string removeBogus(const string& input) {
    string output;
    bool insideBracket = false;

    for (char c : input) {
        if (c == '[')
            insideBracket = true;
        else if (c == ']')
            insideBracket = false;
        else if (!insideBracket)
            output += c;
    }

    return output;
}

// Convert hex string to byte
unsigned char hexToByte(const string& hex) {
    return static_cast<unsigned char>(stoi(hex, nullptr, 16));
}

// Parse \xHH format into byte array
vector<unsigned char> parseHexFormat(const string& input) {
    vector<unsigned char> bytes;

    for (size_t i = 0; i < input.size(); ++i) {
        if (input[i] == '\\' && i + 3 < input.size() && input[i + 1] == 'x') {
            string hex = input.substr(i + 2, 2);
            bytes.push_back(hexToByte(hex));
            i += 3;
        }
    }

    return bytes;
}

/* ==============================
        Decryption Core
=================================*/
string decryptOnce(const string& input) {

    vector<unsigned char> bytes = parseHexFormat(input);

    if (bytes.empty())
        return input;

    unsigned char key = bytes[0];

    string output;

    for (size_t i = 1; i < bytes.size(); ++i) {
        char original = bytes[i] ^ key;
        output += original;
    }

    return output;
}

/* ==============================
        MAIN
=================================*/
int main(int argc, char** argv) {

    DeobfuscationConfig config;

    // Parse CLI
    for (int i = 1; i < argc; ++i) {
        string arg = argv[i];
        if (arg == "--cycles" && i + 1 < argc)
            config.cycles = stoi(argv[++i]);
    }

    cout << "Paste obfuscated input:\n";
    string input;
    getline(cin, input);

    // Step 1: Remove bogus noise
    string cleaned = removeBogus(input);

    // Step 2: Reverse cycles (in reverse order)
    string result = cleaned;
    for (int i = 0; i < config.cycles; ++i) {
        result = decryptOnce(result);
    }

    cout << "\n===== DEOBFUSCATED OUTPUT =====\n";
    cout << result << endl;

    return 0;
}
