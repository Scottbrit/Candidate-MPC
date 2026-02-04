export const paths = {
    auth: {
        login: {
            path: "/auth/login",
            getHref: () => "/auth/login",
        },
        magicLink: {
            path: "/auth/magic-link",
            getHref: () => "/auth/magic-link",
        }
    },
    app: {
        root: {
            path: "/",
            getHref: () => "/dashboard",
        },
        dashboard: {
            path: "dashboard",
            getHref: () => "/dashboard",
        },
        updateCandidate: {
            path: "candidates/:candidateId",
            getHref: (candidateId: string) => `/candidates/${candidateId}`,
        },
        newCandidate: {
            path: "candidates/new",
            getHref: () => "/candidates/new",
        },
        candidateSelection: {
            path: "candidate-selection",
            getHref: () => "/candidate/candidate-selection",
        },
        thankYou: {
            path: "thank-you",
            getHref: () => "/candidate/thank-you",
        },
        campaigns: {
            path: "campaigns",
            getHref: () => "/campaigns",
        },
        campaign: {
            path: "campaigns/:campaignId",
            getHref: (campaignId: string) => `/campaigns/${campaignId}`,
        },
    }
} as const;