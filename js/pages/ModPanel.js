import { ref, onMounted } from 'vue';
import Spinner from '../components/Spinner.vue';
import Btn from '../components/Btn.vue';

export default {
    components: { Spinner, Btn },
    setup() {
        const loading = ref(true);
        const selectedFile = ref('');
        const username = ref('');
        const jsonFiles = ref([]);
        const modifiedJson = ref(null);

        // Load JSON files dynamically using require.context
        const loadJsonFiles = () => {
            try {
                const context = require.context('@/data', false, /\.json$/);
                jsonFiles.value = context.keys()
                    .filter(file => !file.includes('/_')) // Exclude files starting with '_'
                    .map(file => file.replace('./', '')); // Remove the './' prefix
                loading.value = false;
            } catch (error) {
                console.error('Error loading JSON files:', error);
                alert('Failed to load JSON files.');
                loading.value = false;
            }
        };

        // Handle file selection
        const updateUsername = async () => {
            if (!selectedFile.value || !username.value) {
                alert('Please select a file and enter a username.');
                return;
            }

            try {
                const filePath = `@/data/${selectedFile.value}`;
                const fileContent = require(`${filePath}`);
                let jsonData = fileContent;

                // Define the template object
                const userTemplate = {
                    user: username.value,
                    percent: 100,
                };

                // Ensure the "records" array exists and add the template object to it
                if (Array.isArray(jsonData.records)) {
                    jsonData.records.push(userTemplate);
                } else {
                    throw new Error('The "records" section is missing or is not an array.');
                }

                // Store the modified JSON to download later
                modifiedJson.value = jsonData;

                alert('Username added successfully!');
            } catch (error) {
                console.error('Error updating username:', error);
                alert('An error occurred while updating the JSON.');
            }
        };

        // Handle downloading modified JSON
        const downloadJson = () => {
            if (!modifiedJson.value) {
                alert('No modified JSON to download. Please update the username first.');
                return;
            }

            const jsonString = JSON.stringify(modifiedJson.value, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = selectedFile.value ? selectedFile.value.split('/').pop() : 'modified.json';
            a.click();
            URL.revokeObjectURL(url); // Clean up the URL object
        };

        onMounted(loadJsonFiles);

        return { loading, selectedFile, username, jsonFiles, modifiedJson, updateUsername, downloadJson };
    }
};
