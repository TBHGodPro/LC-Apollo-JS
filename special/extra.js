eval(`
import('@buf/lunarclient_apollo.bufbuild_es/lunarclient/apollo/extra.js').then(data => {
    Object.keys(data).forEach(key => {
        exports[key] = data[key];
    })
});
`);
