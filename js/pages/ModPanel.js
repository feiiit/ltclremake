import { fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    data() {
        return {
            loading: false,
            selectedFile: null,
            username: '',
            modifiedJson: null
        };
    },
    methods: {
        onFileChange(event) {
            this.selectedFile = event.target.files[0];
        },
        async updateUsername() {
            if (!this.selectedFile || !this.username) {
                alert("Please select a file and enter a username.");
                return;
            }

            try {
                // Read the JSON file
                const fileContent = await this.readFile(this.selectedFile);
                let jsonData = JSON.parse(fileContent);

                // Define the template object
                const userTemplate = {
                    "user": this.username,
                    "percent": 100
                };

                // Ensure that jsonData is an array or object, and append the template correctly
                if (Array.isArray(jsonData)) {
                    jsonData.push(userTemplate);
                } else if (typeof jsonData === 'object') {
                    // If the root is an object, append the userTemplate in a meaningful way
                    // Assuming you want to add this as a new entry in a list or at a root level
                    if (!jsonData.entries) {
                        jsonData.entries = [];
                    }
                    jsonData.entries.push(userTemplate);
                } else {
                    throw new Error("Unsupported JSON structure");
                }

                // Store the modified JSON to download later
                this.modifiedJson = jsonData;

                alert("Username added successfully!");
            } catch (error) {
                console.error("Error updating username:", error);
            }
        },
        readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
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
            a.download = this.selectedFile ? this.selectedFile.name : "modified.json";
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
                <input type="file" id="jsonFile" @change="onFileChange" accept=".json" required><br>
                
                <Btn type="submit">Update Username</Btn>
            </form>

            <br>
            <Btn @click="downloadJson">Download Modified JSON</Btn>
        </main>`
};
