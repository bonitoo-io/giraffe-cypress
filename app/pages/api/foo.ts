
export default function handler(req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
        name: process.env.INFLUX_USERNAME,
        token: process.env.INFLUX_TOKEN }))
}
