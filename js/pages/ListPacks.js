import { fetchPacks, fetchPackLevels } from "../content.js";
import { getFontColour, embed } from "../util.js";
import { score } from "../score.js";
import { store } from "../main.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: {
        Spinner,
        LevelAuthors,
    },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="pack-list">
            <div class="packs-nav">
                <div>
                    <button @click="switchLevels(i)" v-for="(pack, i) in packs" :style="{background: pack.colour}" class="type-label-lg">
                        <p>{{pack.name}}</p>
                    </button>
                </div>
            </div>
            <div class="list-container">
                <table class="list" v-if="selectedPackLevels">
                    <tr v-for="(level, i) in selectedPackLevels">
                        <td class="rank">
                            <p class="type-label-lg">#{{ i + 1 }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selectedLevel == i, 'error': !level[0] }">
                            <button :style= "[selectedLevel == i ? {background: #1d1d1d} : {}]" @click="selectedLevel = i">
                                <span class="type-label-lg">{{ level[0]?.level.name || \`Error (\${level[1]}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="selectedPackLevels[selectedLevel][0]">
                    <h1>{{ selectedPackLevels[selectedLevel][0].level.name }}</h1>
                    <LevelAuthors :author="selectedPackLevels[selectedLevel][0].level.author" :creators="selectedPackLevels[selectedLevel][0].level.creators" :verifier="selectedPackLevels[selectedLevel][0].level.verifier"></LevelAuthors>
                    <div style="display:flex">
                        <div v-for="pack in selectedPackLevels[selectedLevel][0].level.packs" class="tag" :style="{background:pack.colour, color:getFontColour(pack.colour)}">{{pack.name}}</div>
                    </div>
                    <div v-if="selectedPackLevels[selectedLevel][0].level.showcase" class="tabs">
                        <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification</span>
                        </button>
                        <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ selectedPackLevels[selectedLevel][0].level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ selectedPackLevels[selectedLevel][0].level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 150"><strong>{{ selectedPackLevels[selectedLevel][0].level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else>100% or better to qualify</p>
                    <table class="records">
                        <tr v-for="record in selectedPackLevels[selectedLevel][0].records" class="record">
                            <td class="percent">
                                <p>100%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store?.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <h3>Apie pakelius</h3>
                    <p>
                        Pakelį sudaro 3-5 panašaus sunkumo ir tematikos lygiai. Vieno pakelio lygiai neprivalo būti sukurti to pačio kūrėjo - galima daryti neoficialius priedus į kokią nors išbandymų seriją arba net sukurti naują seriją iš kokio vieno lygio sąraše jei labai patinka jo tema. Temos panašumas gali būti su žaidimo režimu, stiliumi, gameplay, arba kitokiais aspektais (pvz. pavadinimais arba kad išbandymai yra sukurti kelių žmonių pagalba). Lygiai gali būti iš skirtingų difficulty ranges, jei ta riba pereinama nedaug, pvz jei 2 lygiai kažkur 42-37 vietose (lengvo sunkumo), o vienas 34 vietoje (vidutinio sunkumo). Tokiais atvėjais pakelis bus skaitomas to sunkumo, kurio difficulty range lygių yra daugiau.
                    </p>
                    <h3>Kaip gauti pakelių roles?</h3>
                    <p>
                        Norint gauti pakelio role, į #⁠pakelių-prašymas parašykit kokios role norit ir patikrinsim ar tikrai įveikėte pakelyje esančius lygius. (jei lygis yra legacy ir įveikėt jį PO jo iškritimo iš listo, turėsit būtinai atsiųst completion video į anksčiau minėtą kanalą)
                    </p>
                    <p> Pakelių funkcija sukurta KrisGra. </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        store,
        packs: [],
        errors: [],
        selected: 0,
        selectedLevel: 0,
        selectedPackLevels: [],
        loading: true,
        loadingPack: true,
        toggledShowcase: false,
    }),
    computed: {
        pack() {
            return this.packs[this.selected];
        },
        video() {
            if (
                !this.selectedPackLevels[this.selectedLevel][0].level.showcase
            ) {
                return embed(
                    this.selectedPackLevels[this.selectedLevel][0].level
                        .verification
                );
            }

            return embed(
                this.toggledShowcase
                    ? this.selectedPackLevels[this.selectedLevel][0].level
                          .showcase
                    : this.selectedPackLevels[this.selectedLevel][0].level
                          .verification
            );
        },
    },
    async mounted() {
        this.packs = await fetchPacks();
        this.selectedPackLevels = await fetchPackLevels(
            this.packs[this.selected].name
        );

        // Error handling
        if (!this.packs) {
            this.errors = [
                "Nepavyko pakrauti sąrašo. Pabandykite po kelių minučių arba praneškite sąrašo moderatoriams.",
            ];
        } else {
            this.errors.push(
                ...this.selectedPackLevels
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Nepavyko pakrauti lygio. (${err}.json)`;
                    })
            );
        }

        // Hide loading spinner
        this.loading = false;
        this.loadingPack = false;
    },
    methods: {
        async switchLevels(i) {
            this.loadingPack = true;

            this.selected = i;
            this.selectedLevel = 0;
            this.selectedPackLevels = await fetchPackLevels(
                this.packs[this.selected].name
            );
            // Error handling
            this.errors.length = 0;
            if (!this.packs) {
                this.errors = [
                    "Nepavyko pakrauti sąrašo. Pabandykite po kelių minučių arba praneškite sąrašo moderatoriams.",
                ];
            } else {
                this.errors.push(
                    ...this.selectedPackLevels
                        .filter(([_, err]) => err)
                        .map(([_, err]) => {
                            return `Nepavyko pakrauti lygio. (${err}.json)`;
                        })
                );
            }
            this.loadingPack = false;
        },
        score,
        embed,
        getFontColour,
    },
};
