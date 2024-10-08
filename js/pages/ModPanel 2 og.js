import { fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <form>
            <label for="username">Player's username:</label><br>
            <input type="text" id="username" name="username"><br>
            <input type="button" value="Click me" onclick="msg()">
            </form>
        </main>`
};
