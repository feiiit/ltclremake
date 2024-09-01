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
            username: ''
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
                const jsonData = JSON.parse(fileContent);

                // Define the template object
                const userTemplate = {
                    "user": this.username,
                    "percent": 100
                };

                // Add the template object to the JSON data
                if (!jsonData.users) {
                    jsonData.users = [];
                }
                jsonData.users.push(userTemplate);

                // Save the modified JSON file (you'll need to implement this server-side)
                await this.saveFile(this.selectedFile.name, jsonData);

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
        async saveFile(filename, jsonData) {
            // This method will handle sending the modified JSON data to your server.
            // Example (using fetch):
            await fetch('/save-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename, data: jsonData }),
            });
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
        </main>`
};
