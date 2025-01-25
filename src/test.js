async function fetchData() {
    try {
        let response = await fetch("https://clist.by/problems/?search=2063&resource=1");
        console.log(response);
        let htmlText = await response.text();
        // console.log(htmlText);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();