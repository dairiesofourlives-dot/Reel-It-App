
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../styles/commonStyles';

export default function TermsOfUseScreen() {
  const router = useRouter();

  const goBack = () => {
    console.log('Back from terms');
    router.back();
  };

  return (
    <View style={[commonStyles.wrapper, styles.wrapper]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Reel’It – Terms of Use</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
        <Text style={styles.date}>Effective Date: 18th September 2025</Text>

        <Text style={styles.p}>
          Welcome to Reel’It, a platform that allows users to create, share, and engage with short-form video content.
          By using our app, you agree to these Terms of Use. Please read them carefully.
        </Text>

        <Text style={styles.h2}>1. Acceptance of Terms</Text>
        <Text style={styles.p}>
          By accessing or using Reel’It, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, you may not use the app.
        </Text>

        <Text style={styles.h2}>2. Eligibility</Text>
        <Text style={styles.p}>
          You must be at least 13 years old to use Reel’It. By signing up, you confirm that you meet this age requirement.
        </Text>

        <Text style={styles.h2}>3. Account Registration</Text>
        <Text style={styles.p}>- Users must provide accurate information during registration.</Text>
        <Text style={styles.p}>- You are responsible for maintaining the security of your account credentials.</Text>
        <Text style={styles.p}>- You may not share your account with others or use someone else’s account without permission.</Text>

        <Text style={styles.h2}>4. User Content</Text>
        <Text style={styles.p}>- You retain ownership of any videos, photos, or other content you post.</Text>
        <Text style={styles.p}>
          - By posting content on Reel’It, you grant us a non-exclusive, worldwide, royalty-free license to host, use, distribute, modify, and display your content within the app.
        </Text>
        <Text style={styles.p}>
          - You may not post content that is illegal, harmful, threatening, abusive, discriminatory, or infringes on others’ rights.
        </Text>

        <Text style={styles.h2}>5. Prohibited Activities</Text>
        <Text style={styles.p}>You agree not to:</Text>
        <Text style={styles.p}>- Violate any applicable law or regulation.</Text>
        <Text style={styles.p}>- Post content that is offensive, explicit, or defamatory.</Text>
        <Text style={styles.p}>- Impersonate another person or entity.</Text>
        <Text style={styles.p}>- Hack, reverse engineer, or interfere with the app’s functionality.</Text>
        <Text style={styles.p}>- Use the app for unauthorized commercial purposes.</Text>

        <Text style={styles.h2}>6. Intellectual Property</Text>
        <Text style={styles.p}>
          All content, design, logos, and trademarks on Reel’It are the property of Reel’It or its licensors. You may not use them without explicit permission.
        </Text>

        <Text style={styles.h2}>7. Termination</Text>
        <Text style={styles.p}>
          We may suspend or terminate your account at any time for violating these Terms of Use or for any activity that threatens the safety or integrity of the app.
        </Text>

        <Text style={styles.h2}>8. Disclaimers</Text>
        <Text style={styles.p}>
          Reel’It is provided "as is" and "as available." We do not guarantee uninterrupted access or that content posted will be error-free. You use the app at your own risk.
        </Text>

        <Text style={styles.h2}>9. Limitation of Liability</Text>
        <Text style={styles.p}>
          Reel’It is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the app, including content posted by other users.
        </Text>

        <Text style={styles.h2}>10. Modifications</Text>
        <Text style={styles.p}>
          We may update these Terms of Use at any time. Changes will be posted within the app, and continued use of Reel’It constitutes acceptance of the updated terms.
        </Text>

        <Text style={styles.h2}>11. Governing Law</Text>
        <Text style={styles.p}>
          These Terms of Use are governed by the laws of South Africa. Any disputes will be resolved in the courts of this jurisdiction.
        </Text>

        <Text style={styles.h2}>12. Contact Us</Text>
        <Text style={styles.p}>For questions or concerns about these Terms of Use, please contact us at:</Text>
        <Text style={styles.p}>Email: info@se-mo.com</Text>
        <Text style={styles.p}>Address: South Africa, Johannesburg</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  backTxt: {
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  date: {
    color: colors.grey,
    marginBottom: 12,
  },
  h2: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  p: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
});
