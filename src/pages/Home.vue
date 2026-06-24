<script setup lang="ts">
type HomeSection = {
    title: string
    text: string
    image: string
    align: 'start' | 'end' | 'center'
    buttonText?: string
    route?: string
}

const sections: HomeSection[] = [
    {
        title: 'DECKForge',
        text: 'Build decks, browse cards, discover strategies, and expand your Yu-Gi-Oh! collection in one place.',
        image: '/egyptian_gods_banner.jpg',
        align: 'center'
    },
    {
        title: 'Browse Community Decks',
        text: 'Explore public decks and find inspiration for your own.',
        image: '/exodia_banner.jpg',
        align: 'start',
        buttonText: 'Browse Decks',
        route: '/decks'
    },
    {
        title: 'Search The Card Catalogue',
        text: 'Move through the card library with fast search, useful filters, and hover previews that keep card details close.',
        image: '/monsters_banner.jpg',
        align: 'end',
        buttonText: 'Explore Cards',
        route: '/card-catalogue'
    },
    {
        title: 'Build And Tune Decks',
        text: 'Assemble your main, extra, and side deck while searching the card pool without leaving the builder.',
        image: '/yugi_dragon_knight_banner.jpg',
        align: 'start',
        buttonText: 'Start Building',
        route: '/deckbuilder'
    },
    {
        title: 'Shop Sealed Sets',
        text: 'Browse Yu-Gi-Oh! sets, compare releases, and add sealed products to your collection.',
        image: '/yugi_kaiba_white_banner.jpg',
        align: 'end',
        buttonText: 'Visit Set Shop',
        route: '/shop'
    }
]
</script>

<template>
    <div class="home-page">
        <section
            v-for="section in sections"
            :key="section.title"
            class="home-banner"
            :class="`content-${section.align}`"
            :style="{ backgroundImage: `url(${section.image})` }"
        >
            <div class="banner-overlay"></div>

            <div class="container banner-content">
                <div class="banner-copy">
                    <h1>{{ section.title }}</h1>
                    <p>{{ section.text }}</p>

                    <RouterLink
                        v-if="section.route && section.buttonText"
                        :to="section.route"
                        class="btn btn-primary btn-lg banner-action"
                    >
                        {{ section.buttonText }}
                        <i class="fa-solid fa-arrow-right"></i>
                    </RouterLink>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.home-page {
    background: #0f172a;
    flex: 1;
}

.home-banner {
    align-items: center;
    background-position: center;
    background-size: cover;
    display: flex;
    min-height: 60vh;
    overflow: hidden;
    position: relative;
}

.home-banner + .home-banner {
    border-top: 0;
}

.home-banner + .home-banner::before {
    background:
        linear-gradient(to bottom, #f0c96a 0, #b58124 35%, #6d4312 68%, #2b1908 100%);
    box-shadow:
        0 1px 0 rgba(255, 232, 145, 0.75) inset,
        0 -2px 0 rgba(20, 12, 3, 0.75) inset,
        0 4px 10px rgba(0, 0, 0, 0.38);
    content: "";
    height: 13px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
}

.home-banner:first-child {
    min-height: 66vh;
}

.banner-overlay {
    background: rgba(5, 10, 20, 0.38);
    inset: 0;
    position: absolute;
}

.banner-content {
    display: flex;
    position: relative;
    z-index: 1;
}

.content-start .banner-content {
    justify-content: flex-start;
}

.content-end .banner-content {
    justify-content: flex-end;
}

.content-center .banner-content {
    justify-content: center;
    text-align: center;
}

.banner-copy {
    color: #ffffff;
    max-width: 620px;
    padding-bottom: 4rem;
    padding-top: 4rem;
}

.banner-copy h1 {
    font-size: clamp(2.6rem, 6vw, 5.8rem);
    font-weight: 900;
    line-height: 0.96;
    margin-bottom: 1rem;
    text-shadow:
        0 4px 10px rgba(0, 0, 0, 0.85),
        0 14px 30px rgba(0, 0, 0, 0.72);
}

.banner-copy p {
    color: #e5ebf5;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    line-height: 1.55;
    margin-bottom: 1.6rem;
    max-width: 560px;
    text-shadow:
        0 3px 8px rgba(0, 0, 0, 0.92),
        0 10px 20px rgba(0, 0, 0, 0.7);
}

.content-center .banner-copy p {
    margin-left: auto;
    margin-right: auto;
}

.banner-action {
    align-items: center;
    display: inline-flex;
    gap: 0.55rem;
    font-weight: 700;
}

@media (max-width: 767.98px) {
    .home-banner,
    .home-banner:first-child {
        min-height: 62vh;
    }

    .banner-overlay {
        background: rgba(5, 10, 20, 0.48);
    }

    .banner-content,
    .content-start .banner-content,
    .content-end .banner-content,
    .content-center .banner-content {
        justify-content: flex-start;
        text-align: left;
    }

    .banner-copy {
        padding-bottom: 3rem;
        padding-top: 3rem;
    }

    .content-center .banner-copy p {
        margin-left: 0;
        margin-right: 0;
    }
}
</style>
