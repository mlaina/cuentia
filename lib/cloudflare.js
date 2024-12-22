import axios from 'axios'

export function wrapText (text, maxLength) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  words.forEach((word) => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

export async function uploadImage (image) {
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`
  const formData = new FormData()
  formData.append('file', new Blob([image]), 'image.png')
  formData.append('requireSignedURLs', 'false')

  const cfResponse = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ID}/images/v1`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': `multipart/form-data boundary=${boundary}`
      }
    }
  )

  const cfResult = cfResponse.data

  if (!cfResult.success) {
    console.error('Error al subir la imagen a Cloudflare:', cfResult.errors)
    throw new Error('Error al subir la imagen a Cloudflare')
  }

  return cfResult.result.variants[0]
}

export async function uploadImageUrl (imageUrl) {
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`

  // Fetch the image from the URL
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  const formData = new FormData()
  formData.append('file', new Blob([imageBuffer]), 'image.png')
  formData.append('requireSignedURLs', 'false')

  try {
    const cfResponse = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ID}/images/v1`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
      }
    )

    const cfResult = cfResponse.data

    if (!cfResult.success) {
      console.error('Error al subir la imagen a Cloudflare:', cfResult.errors)
      throw new Error('Error al subir la imagen a Cloudflare')
    }

    return cfResult.result.variants[0]
  } catch (error) {
    console.error('Error en la solicitud a Cloudflare:', error)
    throw error
  }
}

export async function deleteImage (imageId) {
  try {
    const response = await axios.delete(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ID}/images/v1/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
        }
      }
    )

    const result = response.data

    if (!result.success) {
      console.error('Error al eliminar la imagen de Cloudflare:', result.errors)
      throw new Error('Error al eliminar la imagen de Cloudflare')
    }

    return true
  } catch (error) {
    console.error('Error en la solicitud de eliminación a Cloudflare:', error)
    throw error
  }
}
