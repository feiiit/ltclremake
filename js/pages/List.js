import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 75" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <button onclick= {{ level.nong }}> </button>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Taškų vertė</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Lygio ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                    </ul>
                    <h2>Rekordai</h2>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>eina na... (ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Puslapio layout pasiskolintas iš <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h4>Listo modai:</h4>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h4>Completionų submittinimo taisyklės:</h4>
                    <p>
                        Turi būti nufilmuotas completion (obviously) ir su aiškiai girdimais clickais.
                    </p>
                    <p>
                        Turi būti matoma mirtis prieš completion attempt. (jei sugebėjai one attemptint po practice arba iškart
              įeinant į level, turi parodyt ir tai)
                    </p>
                    <p>
                        Turi būti matomas end screen ir "Level Complete" tekstas.
                    </p>
                    <p>
                        Nenaudokit bug routes ir skips, arba jei labai buggy levelis tai bent naudokit kuo įmanoma mažiau.
                    </p>
                    <h4>Challengų submittinimo taisyklės:</h4>
                    <p>
                        Challenge negali būti layout. Turi būti kažkiek dekoruotas, normaliai sustruktūruotas ir būt bent šiek
              tiek visually appealing. OBJECT SPAM =/= DEKORACIJA, nebent ji done right (pavyzdžiui Slick Challenge
              series, Say Gex). Default layout blocks naudot galima, bet tada turi būti labai geri ir pilnai užpildyti
              structures, ir/arba normalesnis background deco. Ar jūsų lygio dekoracija gerai atrodo nusprendžia list
              modai kolektyviai.
                    </p>
                    <p>
                        Challenge turi būti orginalus. Jis negali būti tiesiog buffed arba/ir tik šiek tiek pakeista kito
              challenge versija, ir negali būti kito lygio dalis, nesvarbu ar tas lygis jis unreleased ar ne.
                    </p>
                    <p>
                        Verificationai turi būti keliami į YouTube. Ar public ar unlisted, jau jūsų sprendimas.
                    </p>
                    <p>
                        Jei daromas redeco update lygiui ir tas redeco labai mažai pakeičia difficulty arba išvis nekeičia,
              reverification nebūtinas.
                    </p>
                    <p>
                        Challenge turi būti pilnai lietuviškas - gameplay sukurtas lietuvio, dekoracija sukurta lietuvio. Tik
              verification gali būti ne lietuvio.
                    </p>
                    <p>
                        Naudok common sense ir neieškok loop holes taisyklėse.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Nepavyko pakrauti listo. Arba bandykite vėliau arba parašykit listo modam.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Nepavyko pakrauti lygio. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Nepavyko pakrauti listo modų.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
