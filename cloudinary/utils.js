const cloudinary = require("cloudinary").v2;

const getImageDetails = async (url) => {
  const publicId = extractPublicId(url);
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      sizeInKB: result.bytes / 1024,
    };
  } catch (error) {
    if (error.http_code === 404) {
      console.error(`Imagen no encontrada en Cloudinary: ${publicId}`);
    } else {
      console.error('Error fetching image details:', error);
    }
    return null;
  }
};

module.exports = getImageDetails;

function extractPublicId(url) {
  const parts = url.split('/');
  const publicIdWithExtension = parts.pop();
  const publicId = publicIdWithExtension.split('.')[0];
  return publicId;
}
