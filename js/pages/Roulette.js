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
                <div class="sidebar">
                <form class="options">
                    <div class="check">
                        <input type="checkbox" id="main" value="Main List" v-model="useMainList">
                        <label for="main">Main List</label>
                    </div>
                    <div class="check">
                        <input type="checkbox" id="legacy" value="Legacy" v-model="useLegacyList">
                        <label for="extended">Legacy</label>
                    </div>
                    <Btn @click.native.prevent="onStart">{{ levels.length === 0 ? 'Pradėti' : 'Pradėti iš naujo'}}</Btn>
                </form>
                <p class="type-label-md" style="color: #aaa">
                    Ruletė išsisaugoja automatiškai.
                </p>
                <form class="save">
                    <p>Savarankiškas progreso importavimas/exportavimas</p>
                    <div class="btns">
                        <Btn @click.native.prevent="onImport">Importuoti</Btn>
                        <Btn :disabled="!isActive" @click.native.prevent="onExport">Exportuoti</Btn>
                    </div>
                </form>
            </div>
            <section class="levels-container">
                <div class="levels">
                    <template v-if="levels.length > 0">

                        <!-- Completed levels -->
                        <div class="level" v-for="(level, i) in levels.slice(0, progression.length)">
                            <a :href="level.video" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                            </a>
                            <div class="meta">
                                <p>#{{ level.rank }}</p>
                                <h2>{{ level.name }}</h2>
                                <p style="color: #00b54b; font-weight: 700">{{ progression[i] }}%</p>
                            </div>
                        </div>

                        <!-- Current Level -->
                        <div class="level" v-if="!hasCompleted">
                            <a :href="currentLevel.video" target="_blank" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(currentLevel.video))" alt="">
                            </a>
                            <div class="meta">
                                <p>#{{ currentLevel.rank }}</p>
                                <h2>{{ currentLevel.name }}</h2>
                                <p>{{ currentLevel.id }}</p>
                            </div>
                            <form class="actions" v-if="!givenUp">
                                <input type="number" v-model="percentage" :placeholder="placeholder" :min="currentPercentage" max=100>
                                <Btn @click.native.prevent="onDone">Baigta</Btn>
                                <Btn @click.native.prevent="onGiveUp" style="background-color: #e91e63;">Pasiduoti</Btn>
                            </form>
                        </div>

                        <!-- Results -->
                        <div v-if="givenUp || hasCompleted" class="results">
                            <h1>Rezultatai</h1>
                            <p>Lygių kiekis: {{ progression.length }}</p>
                            <p>Aukščiausi procentai: {{ currentPercentage - 5 }}%</p>
                            <Btn v-if="currentPercentage < 99 && !hasCompleted" @click.native.prevent="showRemaining = true">Parodyti likusius lygius</Btn>
                        </div>

                        <!-- Uncompleted level display after giving up -->
                        <template v-if="givenUp && showRemaining">
                            <div class="level" v-for="(level, i) in levels.slice(progression.length, levels.length+1)">
                            <template v-if="(currentPercentage + 5*i < 105)">
                                <a :href="level.video" target="_blank" class="video">
                                    <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                                </a>
                                <div class="meta">
                                    <p>#{{ level.rank }}</p>
                                    <h2>{{ level.name }}</h2>
                                    <p v-if="currentPercentage + 5*i > 100" style="color: #d50000; font-weight: 700">100%</p>
                                    <p v-else style="color: #d50000; font-weight: 700">{{ currentPercentage + 5*i }}%</p>
                                </div>
                            </div>
                            </template>
                        </template>
                    </template>
                </div>
            </section>
            <div class="toasts-container">
                <div class="toasts">
                    <div v-for="toast in toasts" class="toast">
                        <p>{{ toast }}</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: false,
        levels: [],
        progression: [], // list of percentages completed
        percentage: undefined,
        givenUp: false,
        showRemaining: false,
        useMainList: true,
        useLegacyList: true,
        toasts: [],
        fileInput: undefined,
    }),
};
