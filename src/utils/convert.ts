export default function tryParseInt(str: string): number {
    if (str) {
        try {
            return parseInt(str, 10);
        } catch (e) {
            return 0;
        }
    }

    return 0;
}
