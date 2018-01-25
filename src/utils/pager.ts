export default function createPager(totalCount: number, currentPage: number, pageSize: number) {
    const totalFullPageCount = Math.floor(totalCount / pageSize);
    const totalPageCount = Math.ceil(totalCount / pageSize);

    let offset = 0;

    if (currentPage && currentPage > 0 && currentPage < totalPageCount) {
        offset = Math.max(totalCount - currentPage * pageSize, 0);
    } else {
        currentPage = totalPageCount;
    }

    return {
        pageSize,
        currentPage,
        offset,
        nextPage: (currentPage > 1) ? (currentPage - 1) : null,
        previousPage: (currentPage < totalPageCount) ? (currentPage + 1) : null,
    };
}
