import { PhotoProcessor } from "@/PhotoProcessor";

export const App = () => {
    return (
        <section className="bg-primary min-h-full flex items-center">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col justify-center text-center">
                    <h2 className="text-display-sm font-semibold text-primary md:text-display-md">rembg.nieradko.com</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">Remove background from your pictures locally in your browser! Powered by <a className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2" href="https://www.npmjs.com/package/rembg-webgpu">rembg-webgpu</a> ⚡.</p>
                    <div className="mt-8 flex flex-col-reverse gap-3 self-stretch md:mt-8 md:flex-row md:self-center">
                        <PhotoProcessor />
                    </div>
                </div>
            </div>
        </section>
    );
};