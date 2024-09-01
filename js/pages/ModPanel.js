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
            modifiedJson: null,
            serverFileUrl: './data/myfile.json' // Default URL or set it dynamically
        };
    },
    methods: {
        async fetchFileFromServer() {
            try {
                const response = await fetch(this.serverFileUrl);
                if (!response.ok) throw new Error('Network response was not ok');
                const fileContent = "./data/undisclosed.json"
                this.modifiedJson = fileContent.json();
            } catch (error) {
                console.error("Error fetching file from server:", error);
                alert("An error occurred while fetching the JSON from the server.");
            }
        },
        async updateUsername() {
            if (!this.username) {
                alert("Please enter a username.");
                return;
            }

            try {
                // Fetch the JSON file from the server
                await this.fetchFileFromServer();
                
                // Define the template object
                const userTemplate = {
                    "user": this.username,
                    "percent": 100
                };

                // Ensure the "records" array exists and add the template object to it
                if (this.modifiedJson.records && Array.isArray(this.modifiedJson.records)) {
                    this.modifiedJson.records.push(userTemplate);
                } else {
                    throw new Error('The "records" section is missing or is not an array.');
                }

                // Notify user
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
            a.download = "modified.json";
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
                
                <label for="jsonFile">Fetch JSON file from server:</label><br>
                <button @click.prevent="fetchFileFromServer">Fetch JSON</button><br>
                
                <Btn type="submit">Update Username</Btn>
            </form>

            <br>
            <Btn @click="downloadJson">Download Modified JSON</Btn>
        </main>`
};
