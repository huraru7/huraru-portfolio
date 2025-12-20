function getSunHours(date, latitude, longitude) {
	const rad = Math.PI / 180;
	const dayMs = 1000 * 60 * 60 * 24;

	const J1970 = 2440588;
	const J2000 = 2451545;

	const toJulian = (date) => date / dayMs - 0.5 + J1970;
	const toDays = (date) => toJulian(date) - J2000;

	const d = toDays(date);

	const M = rad * (357.5291 + 0.98560028 * d);
	const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));

	const P = rad * 102.9372;
	const L = M + C + P + Math.PI;

	const dec = Math.asin(Math.sin(L) * Math.sin(rad * 23.44));

	const Jtransit = J2000 + d + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

	const h0 = rad * -0.83;

	const w = Math.acos((Math.sin(h0) - Math.sin(rad * latitude) * Math.sin(dec)) / (Math.cos(rad * latitude) * Math.cos(dec)));

	const Jrise = Jtransit - w / (2 * Math.PI);
	const Jset = Jtransit + w / (2 * Math.PI);

	// 誤差修正で4時間足しています
	const sunriseHour = (new Date((Jrise - J1970 + 0.5) * dayMs).getUTCHours() + 4) % 24;
	const sunsetHour = (new Date((Jset - J1970 + 0.5) * dayMs).getUTCHours() + 4) % 24;

	return {
		sunriseHour,
		sunsetHour,
	};
}
