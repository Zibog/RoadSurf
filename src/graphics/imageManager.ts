export class ImageManager {
    private static images: any[];
    static loadImages(imagePaths: string[], onLoadComplete: any, onFailure: any) {
        this.images = [];

        const promises = imagePaths.map(imagePath => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onerror = () => reject(img);
                img.onload = () => resolve(img);
                img.src = imagePath;
            });
        });

        const onImagesSuccessfullyLoaded = (images: any[]) => {
            this.images = images;
            onLoadComplete();
        };

        Promise.all(promises).then(onImagesSuccessfullyLoaded, onFailure);
    }

    static getImage(filePath: string) {
        return this.images.find(image => {
            return image.src.includes(filePath);
        });
    }
}