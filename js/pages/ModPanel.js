import { fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    data() {
        return {
            loading: true,
            selectedFile: null,
            username: '',
            jsonFiles: [], // List of JSON files
            modifiedJson: null
        };
    },
    async created() {
        this.loadJsonFiles();
    },
    methods: {
        // Method to dynamically import JSON files
        loadJsonFiles() {
            // Use require.context to dynamically load JSON files from the ./data directory
            const context = require.context('./data', false, /\.json$/);
            this.jsonFiles = context.keys()
                .filter(file => !file.startsWith('./_')) // Exclude files starting with _
                .map(file => file.replace('./', '')); // Remove the './' from the file name

            this.loading = false;
        },
        onFileSelect(event) {
            const fileName = event.target.value;
            this.selectedFile = `./data/${fileName}`;
        },
        async updateUsername() {
            if (!this.selectedFile || !this.username) {
                alert("Please select a file and enter a username.");
                return;
            }

            try {
                // Dynamically import the selected JSON file
                const fileContent = await import(`${this.selectedFile}`);
                let jsonData = fileContent.default;

                // Define the template object
                const userTemplate = {
                    "user": this.username,
                    "percent": 100
                };

                // Ensure the "records" array exists and add the template object to it
                if (jsonData.records && Array.isArray(jsonData.records)) {
                    jsonData.records.push(userTemplate);
                } else {
                    throw new Error('The "records" section is missing or is not an array.');
                }

                // Store the modified JSON to download later
                this.modifiedJson = jsonData;

                alert("Username added successfully!");
            } catch (error) {
                console.error("Error updating username:", error);
                alert("An error occurred while updating the JSON.");
            }
        },
        downloadJson() {
            if (!this.modifiedJson) {
                alert("No modified JSON to download. Please update the username first.");
                return;
            }

            const jsonString = JSON.stringify(this.modifiedJson, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = this.selectedFile ? this.selectedFile.split('/').pop() : "modified.json";
            a.click();
            URL.revokeObjectURL(url);  // Clean up the URL object
        }
    },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <form @submit.prevent="updateUsername">
                <label for="username">Player's username:</label><br>
                <input type="text" id="username" v-model="username" name="username" required><br>
                
                <label for="jsonFile">Select JSON file:</label><br>
                <select id="jsonFile" @change="onFileSelect" required>
                    <option disabled selected value>Select a JSON file</option>
                    <option v-for="file in jsonFiles" :key="file" :value="file">{{ file }}</option>
                </select><br>
                
                <Btn type="submit">Update Username</Btn>
            </form>

            <br>
            <Btn @click="downloadJson">Download Modified JSON</Btn>
        </main>`
};
