export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
    },
    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Sukūrė & verifyino</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
            <template v-else-if="creators.length === 0">
                <div class="type-title-sm">Kūrėjas</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
                <div class="type-title-sm">Verifyino</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Kūrėjai</div>
                <p class="type-body">
                    <template v-for="(creator, index) in creators" :key="\`creator-\$\{creator\}\`">
                        <span >{{ creator }}</span
                        ><span v-if="index < creators.length - 1">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifyino</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <div class="type-title-sm">Įkėlė</div>
            <p class="type-body">
                <span>{{ author }}</span>
            </p>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.author === this.verifier && this.creators.length === 0;
        },
    },
};
