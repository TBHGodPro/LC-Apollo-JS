eval(`
import('./packets.full.mjs').then(data => {
    Object.keys(data).forEach(key => {
        exports[key] = data[key];
    })
});
`);
