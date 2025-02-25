import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function setupSwagger(app: INestApplication): void {
    const config = app.get(ConfigService);

    const swaggerConfig = {
        name: config.get<string>('doc.name'),
        description: config.get<string>('doc.description'),
        version: config.get<string>('doc.version'),
        prefix: config.get<string>('doc.prefix'),
    };

    const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
            .setTitle(swaggerConfig.name)
            .setDescription(swaggerConfig.description)
            .setVersion(swaggerConfig.version)
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
                'accessToken',
            )
            .addServer('/')
            .addServer('/auth')
            .build(),
        { deepScanRoutes: true },
    );

    SwaggerModule.setup(swaggerConfig.prefix, app, document, {
        explorer: true,
        swaggerOptions: {
            docExpansion: 'none',
            persistAuthorization: true,
            tagsSorter: 'alpha',
            filter: true,
        },
    });
}
