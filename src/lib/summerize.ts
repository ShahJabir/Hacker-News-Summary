export default async function summerize(ai: Ai, url: string, content: string) {
  const maxRetries = 3
  let attempt = 0
  const truncatedContent = content.split('').slice(0, 5500).join('')
  while (attempt < maxRetries) {
    try {
      const answer = await ai.run('@hf/mistral/mistral-7b-instruct-v0.2', {
        raw: true,
        messages: [
          {
            role: 'user',
            content: `Summerize the following article: ${truncatedContent}`,
          },
        ],
        lora: 'cf-public-cnn-summarization',
      })
      console.warn(`Summary generated successfully for article: ${url}`)
      return answer.response || ''
    }
    catch (error) {
      if (attempt < maxRetries) {
        attempt++
        console.warn(`Summary attempt ${attempt} failed \n url:${url} \n Error: ${error}`)
      }
    }
  }
  console.error(`All summary attempts failed. \n url:${url}`)
  return 'Unable to generate summary after max attempts.'
}
