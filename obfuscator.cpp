#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <sstream>
#include <fstream>
#include <algorithm>
#include <chrono>

using namespace std;

/* ==============================
        ObfuscationConfig
=================================*/
struct ObfuscationConfig {
    int obfuscationCycles = 1;
    bool enableStringEncryption = false;
    bool enableBogusControlFlow = false;
    int bogusCodeIntensity = 1;
    unsigned int randomSeed = 0;

    string toJson() const {
        stringstream ss;
        ss << "{\n";
        ss << "  \"cycles\": " << obfuscationCycles << ",\n";
        ss << "  \"enableStringEncryption\": " << (enableStringEncryption ? "true" : "false") << ",\n";
        ss << "  \"enableBogusControlFlow\": " << (enableBogusControlFlow ? "true" : "false") << ",\n";
        ss << "  \"bogusCodeIntensity\": " << bogusCodeIntensity << ",\n";
        ss << "  \"randomSeed\": " << randomSeed << "\n";
        ss << "}";
        return ss.str();
    }
};

/* ==============================
        Metrics
=================================*/
struct ObfuscationMetrics {
    int cycles = 0;
    int bogusBlocks = 0;
    int stringEncryptions = 0;

    void incrementCycle() { cycles++; }
    void incrementBogus() { bogusBlocks++; }
    void incrementString() { stringEncryptions++; }
};

/* ==============================
        Config Parser
=================================*/
class ConfigParser {
public:
    static ObfuscationConfig parse(int argc, char** argv) {
        ObfuscationConfig config;

        for (int i = 1; i < argc; ++i) {
            string arg = argv[i];

            if (arg == "--cycles" && i + 1 < argc)
                config.obfuscationCycles = stoi(argv[++i]);

            else if (arg == "--enable-string-encryption")
                config.enableStringEncryption = true;

            else if (arg == "--enable-bogus")
                config.enableBogusControlFlow = true;

            else if (arg == "--bogus-intensity" && i + 1 < argc)
                config.bogusCodeIntensity = stoi(argv[++i]);

            else if (arg == "--seed" && i + 1 < argc)
                config.randomSeed = stoul(argv[++i]);
        }

        if (config.randomSeed == 0)
            config.randomSeed = chrono::system_clock::now().time_since_epoch().count();

        return config;
    }
};

/* ==============================
        ObfuscationManager
=================================*/
class ObfuscationManager {
private:
    ObfuscationConfig config;
    ObfuscationMetrics metrics;
    mt19937 rng;

    string encryptString(const string& input) {
        string output;
        uniform_int_distribution<int> dist(1, 255);

        int key = dist(rng);
        output += "\\x" + toHex(key);

        for (char c : input) {
            char enc = c ^ key;
            output += "\\x" + toHex((unsigned char)enc);
        }

        metrics.incrementString();
        return output;
    }

    string insertBogus(const string& input) {
        stringstream ss;
        uniform_int_distribution<int> dist(0, 100);

        for (char c : input) {
            ss << c;

            if (dist(rng) < config.bogusCodeIntensity * 5) {
                ss << randomNoise();
                metrics.incrementBogus();
            }
        }
        return ss.str();
    }

    string randomNoise() {
        uniform_int_distribution<int> lenDist(3, 8);
        uniform_int_distribution<int> charDist(33, 126);

        int len = lenDist(rng);
        string noise;
        for (int i = 0; i < len; ++i)
            noise += static_cast<char>(charDist(rng));

        return "[" + noise + "]";
    }

    string toHex(unsigned char c) {
        const char* hex = "0123456789ABCDEF";
        string s;
        s += hex[(c >> 4) & 0xF];
        s += hex[c & 0xF];
        return s;
    }

public:
    ObfuscationManager(const ObfuscationConfig& cfg)
        : config(cfg), rng(cfg.randomSeed) {}

    string run(const string& input) {
        string output = input;

        for (int i = 0; i < config.obfuscationCycles; ++i) {

            if (config.enableStringEncryption)
                output = encryptString(output);

            if (config.enableBogusControlFlow)
                output = insertBogus(output);

            metrics.incrementCycle();
        }

        return output;
    }

    ObfuscationMetrics getMetrics() const { return metrics; }
};

/* ==============================
        Report Generator
=================================*/
class ReportGenerator {
public:
    static void generate(const ObfuscationConfig& config,
                         const ObfuscationMetrics& metrics) {

        ofstream out("obfuscation_report.json");

        out << "{\n";
        out << "  \"input_parameters\": " << config.toJson() << ",\n";
        out << "  \"cycles_completed\": " << metrics.cycles << ",\n";
        out << "  \"bogus_blocks\": " << metrics.bogusBlocks << ",\n";
        out << "  \"string_encryptions\": " << metrics.stringEncryptions << "\n";
        out << "}\n";

        out.close();
    }
};

/* ==============================
        MAIN ENTRY (CLI)
=================================*/
int main(int argc, char** argv) {

    ObfuscationConfig config = ConfigParser::parse(argc, argv);

    cout << "Enter text to obfuscate:\n";
    string input;
    getline(cin, input);

    ObfuscationManager manager(config);
    string obfuscated = manager.run(input);

    cout << "\n===== OBFUSCATED OUTPUT =====\n";
    cout << obfuscated << endl;

    ReportGenerator::generate(config, manager.getMetrics());

    cout << "\nReport generated: obfuscation_report.json\n";

    return 0;
}