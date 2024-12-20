import { registerAs } from '@nestjs/config';

export default registerAs('zvonok', () => ({
    publicKey: process.env.ZVONOK_API_PUBLIC_KEY,
    campaignId: parseInt(process.env.ZVONOK_CAMPAIGN_ID, 10),
    flashCallUrl: process.env.ZVONOK_FLASH_CALL_URL,
}));
