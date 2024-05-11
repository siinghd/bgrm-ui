export async function postData(url: string, data: FormData) {
  const response = await fetch(`https://api-bgrm.hsingh.site${url}`, {
    method: 'POST',
    body: data,
  });
  return await response.json();
}

export async function getData(url: string) {
  const response = await fetch(`https://api-bgrm.hsingh.site${url}`);
  return await response.json();
}
