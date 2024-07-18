import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    const packResult = await fetch(`${dir}/_packlist.json`);
    try {
        const list = await listResult.json();
        const packsList = await packResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    let packs = packsList.filter((x) =>
                        x.levels.includes(path)
                    );
                    return [
                        {
                            ...level,
                            packs,
                            path,
                            records: level.records,
                        },
                        null,
                    ];
                } catch {
                    console.error(`Nepavyko užkrauti lygio: #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Nepavyko užkrauti sąrašo.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const packResult = await (await fetch(`${dir}/_packlist.json`)).json();
    const player = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(player).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        player[verifier] ??= {
            verifiedLevels: [],
            
            packsComplete: [],
            path: level.path
        };
        const { verifiedLevels } = player[verifier];
        verifiedLevels.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
            path: level.path
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(player).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            player[user] ??= {
                verifiedLevels: [],          
                progressOnLevels: [],
                packsComplete: [],
            };
            const { completedLevels } = player[user];
            if (record.percent === 100) {
                completedLevels.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                    path: level.path
                });
                return;
            }

            progressOnLevels.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
                path: level.path
            });
        });
    });

    //Player completed packs
    for (let user of Object.entries(player)) {
        let completions = [...user[1]["verifiedLevels"], ...user[1]["completedLevels"]].map(
            (x) => x["levels"]
        );
    
        for (let pack of packResult) {
            if (pack.levels.every((packLevel) => completions.includes(packLevel))) {
                user[1]["packsComplete"].push(pack);
            }
        }
    }

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(player).map(([user, scores]) => {
        const { verifiedLevels, completedLevels} = scores;
        const total = [verifiedLevels, completedLevels]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });
    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];

}

export async function fetchPacks() {
    try {
        const packResult = await fetch(`${dir}/_packlist.json`);
        const packsList = await packResult.json();
        return packsList;
    } catch {
        return null;
    }
}

export async function fetchPackLevels(packname) {
    const packResult = await fetch(`${dir}/_packlist.json`);
    const packsList = await packResult.json();
    const selectedPack = await packsList.find((pack) => pack.name == packname);
    try {
        return await Promise.all(
            selectedPack.levels.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [
                        {
                            level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Nepavyko užkrauti lygio: #${rank + 1} ${path} (${packname}).`);
                    return [null, path];
                }
            })
        );
    } catch (e) {
        console.error(`Nepavyko užkrauti pakelių.`, e);
        return null;
    }
}
