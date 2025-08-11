var searchTemplate;
var paginationTemplate;

function renderResults(data, limit, skip) {
    if (!searchTemplate)
        searchTemplate = htmx.find("#exhibit-template").innerHTML;
    if (!paginationTemplate)
        paginationTemplate = htmx.find("#pagination-template").innerHTML;
    data.data.forEach((entry) => {
        entry.renderedCategory = renderCategory(entry.category);
        return entry;
    });
    var th_gallery = {"data": data.data}
    var output = Mustache.render(searchTemplate, th_gallery);
    htmx.find("#content").innerHTML = output;
    
    let isLast = Math.floor(data.total/limit) > Math.floor(skip/limit) + 1 ? false : true;
    let trueIndex = Math.floor(skip/limit);
    var pagination_data = {lastPage: isLast, first: trueIndex, next: skip+limit, last: data.total-limit, previous: skip-limit, page: Math.floor(skip/limit) + 1, limit: limit, total_pages: Math.floor(data.total/limit)}
    var output = Mustache.render(paginationTemplate, pagination_data);
    htmx.find("#pagination").innerHTML = output;
    htmx.process(htmx.find("#pagination"));
}

function renderAllExhibits(limit=65, skip=0) {
    skip = skip >= 0 ? skip : 0;
    fetch(`${apiURL()}default/latest/${limit}/${skip}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json"
      }
    })
    .then((response) => {
    if (!response.ok)
        throw new Error(response.statusText);
     return response.json();
     })
    .then((data) => {
        if (data.data.length >= 1) {     
            renderResults(data, limit, skip);
        }
        else {
            htmx.find("#output").innerHTML = "No images linked to your discord id were found in ThumbHubBot's database.";
        }
    })
    .catch (error =>
        htmx.find('#output').innerHTML = error
    )}

function renderCategory(category) {
    return "Uncategorized";
}

renderAllExhibits()

function keywordSearch(skip=0, limit=66) {    
    skip = skip >= 0 ? skip : 0;
    keywords = htmx.find("#keywords").value
    const c_keys = {
        keywords: keywords
    }
    fetch(`${apiURL()}default/search/${limit}/${skip}`, {
      method: "POST",
      body: JSON.stringify(c_keys),
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      }
    })
  .then((response) => {
      if (!response.ok)
          throw new Error(response.statusText);
      return response.json();
   })
   .then((data) => {
        if (data.data.length >= 1) {
            renderResults(data, limit, skip);            
        }
        else { 
            let message = "No images found!";
            htmx.find("#output").innerHTML = message;
            renderExhibit();
        }
   })
   .catch (error => htmx.find('#output').innerHTML = error )
}
