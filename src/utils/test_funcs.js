function genSampleTime(min_ms, max_ms) {
    let ms = Phaser.Math.Between(min_ms, max_ms);
    const total_s = ms / 1000;
    const mm = Math.floor(total_s / 60).toString().padStart(2, '0');
    const ss = Math.floor(total_s % 60).toString().padStart(2, '0');
    ms = (ms % 1000).toString().padStart(3, '0');
    return `${mm}:${ss}:${ms}`;
}

function genSampleGameScores(n = 100) {
    let game_hiscores = [];
    for (let i = 1; i <= n; i++) {
        const p_num = Phaser.Math.Between(1, 1000);
        const score = Phaser.Math.Between(500, 10000000000);
        game_hiscores.push(`#${p_num} ${score}`);
    }
    localStorage.setItem('game_hiscores', JSON.stringify(game_hiscores));
}

function genSampleChallengeScores(n = 200) {
    let count = 1;
    let cm_win_times = [], cm_loss_times = [];
    for (let i = 0; i <= n; i++, count++) {
        let rng = Phaser.Math.FloatBetween(0, 1);
        if (rng < .25) {
            const time_str = genSampleTime(390000, 720000);
            cm_win_times.push(`#${count} ${time_str}`);
        } else {
            const time_str = genSampleTime(120000, 420000);
            const num_bosses = Phaser.Math.Between(0, 2);
            cm_loss_times.unshift(`#${count} ${time_str} ${num_bosses}/3`);
        }
    }

    cm_win_times.sort((og_a, og_b) => {
        // remove #NUM
        const a = og_a.split(' ')[1]; // ooga
        const b = og_b.split(' ')[1]; // booga
        // split times by delim
        const aa = a.split(':').map(Number);
        const bb = b.split(':').map(Number);
        // convert times to ms
        const ams = aa[0] * 60000 + aa[1] * 1000 + aa[2];
        const bms = bb[0] * 60000 + bb[1] * 1000 + bb[2];
        if (ams < bms)
            return -1;
        else if (ams > bms)
            return 1;
        else
            return 0;
    });

    localStorage.setItem('cm_win_times', JSON.stringify(cm_win_times));
    localStorage.setItem('cm_loss_times', JSON.stringify(cm_loss_times));
}

function genSampleData() {
    genSampleGameScores(200);
    genSampleChallengeScores(200);
}

export { genSampleData };