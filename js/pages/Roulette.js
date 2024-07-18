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
                            <p>Aukščiausi procentai: {{ currentPercentage }}%</p>
                            <Btn v-if="currentPercentage < 99 && !hasCompleted" @click.native.prevent="showRemaining = true">Parodyti likusius lygius</Btn>
                        </div>

                        <!-- Uncompleted level display after giving up -->
                        <template v-if="givenUp && showRemaining">
                            <div class="level" v-for="(level, i) in levels.slice(progression.length, levels.length+1)">
                                <a :href="level.video" target="_blank" class="video">
                                    <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                                </a>
                                <div class="meta">
                                    <p>#{{ level.rank }}</p>
                                    <h2>{{ level.name }}</h2>
                                    <p style="color: #d50000; font-weight: 700">{{ currentPercentage + 5*i }}%</p>
                                </div>
                            </div>
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
    mounted() {
        // Create File Input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = false;
        this.fileInput.accept = '.json';
        this.fileInput.addEventListener('change', this.onImportUpload);

        // Load progress from local storage
        const roulette = JSON.parse(localStorage.getItem('roulette'));

        if (!roulette) {
            return;
        }

        this.levels = roulette.levels;
        this.progression = roulette.progression;
    },
    computed: {
        currentLevel() //returns the current level that is in the array for the roulette to display
        {
            return this.levels[this.progression.length];
        },
        currentPercentage() //holds the current required percentage
        {
            if(this.progression[this.progression.length - 1] == null){
                return 5;
            }
            else if (this.progression[this.progression.length - 1] >= 95)
            {
                return 100;
            }
            else
            {
                return this.progression[this.progression.length - 1] + 5;
            }
        },
        placeholder() //holds the next percentage for displaying the requirement for the next level in the roulette
        {
            // if (this.currentPercentage >= 95)
            // {
            //     return `Bent 100%`;
            // } 
            // else {
            //     return `Bent ${this.currentPercentage}%`;
            // }
            return `Bent ${this.currentPercentage}%`
            
        },
        hasCompleted() //called whenever the roulette is complete, probably.
        {
            return (
                this.progression.length === this.levels.length ||
                this.progression[this.progression.length - 1] >= 100
            );
        },
        isActive() //checks whether the roulette is still active
        {
            return (
                this.progression.length > 0 &&
                !this.givenUp &&
                !this.hasCompleted
            );
        },
    },
    methods: {
        shuffle,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        async onStart() {
            if (this.isActive) {
                this.showToast('Pasiduok prieš pradėdamas naują ruletę.');
                return;
            }

            if (!this.useMainList && !this.useLegacyList) {
                return;
            }

            this.loading = true;

            const fullList = await fetchList();

            if (fullList.filter(([_, err]) => err).length > 0) {
                this.loading = false;
                this.showToast(
                    'Listas neveikia. Palauk, kol jį sutaisys, kad pradėtum ruletę.',
                );
                return;
            }

            const fullListMapped = fullList.map(([lvl, _], i) => ({
                rank: i + 1,
                id: lvl.id,
                name: lvl.name,
                video: lvl.verification,
            }));
            const list = [];
            if (this.useMainList) list.push(...fullListMapped.slice(0, 75));
            if (this.useLegacyList) {
                list.push(...fullListMapped.slice(75, 150));
            }

            // random 20 levels
            this.levels = shuffle(list).slice(0, 20);
            this.showRemaining = false;
            this.givenUp = false;
            this.progression = [];
            this.percentage = undefined;

            this.loading = false;
        },
        save() {
            localStorage.setItem(
                'roulette',
                JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                }),
            );
        },
        onDone() {
            if (!this.percentage) {
                return;
            }
            if (this.percentage < this.currentPercentage || this.percentage > 100) 
            {
                this.showToast('Netinkami procentai.');
                return;
            }
            this.progression.push(this.percentage);
            this.percentage = undefined;
            this.save();
        },
        onGiveUp() {
            this.givenUp = true;
            // Save progress
            localStorage.removeItem('roulette');
        },
        onImport() {
            if (
                this.isActive &&
                !window.confirm('Dabartinė ruletė bus perrašyta. Tęsti?')
            ) {
                return;
            }

            this.fileInput.showPicker();
        },
        async onImportUpload() {
            if (this.fileInput.files.length === 0) return;

            const file = this.fileInput.files[0];

            if (file.type !== 'application/json') {
                this.showToast('Invalid file.');
                return;
            }

            try {
                const roulette = JSON.parse(await file.text());

                if (!roulette.levels || !roulette.progression) {
                    this.showToast('Neteisingas failas.');
                    return;
                }

                this.levels = roulette.levels;
                this.progression = roulette.progression;
                this.save();
                this.givenUp = false;
                this.showRemaining = false;
                this.percentage = undefined;
            } catch {
                this.showToast('Neteisingas failas.');
                return;
            }
        },
        onExport() {
            const file = new Blob(
                [JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                })],
                { type: 'application/json' },
            );
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'tsl_roulette';
            a.click();
            URL.revokeObjectURL(a.href);
        },
        showToast(msg) {
            this.toasts.push(msg);
            setTimeout(() => {
                this.toasts.shift();
            }, 3000);
        },
    },
};
