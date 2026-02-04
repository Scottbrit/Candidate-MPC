import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import Arial from '@/assets/fonts/Arial/Arial.ttf';
import ArialBold from '@/assets/fonts/Arial/Arial Bold.ttf';
import ArialItalic from '@/assets/fonts/Arial/Arial Italic.ttf';
import type { CandidateExtractedData } from '@/types/api';

const BlindedResumeTemplate = ({ data }: { data: CandidateExtractedData }) => {

    console.log("blinded resume data", data);

    Font.register({ family: 'Arial', src: Arial });

    Font.register({
        family: 'Arial', fonts: [
            { src: Arial }, // font-style: normal, font-weight: normal
            { src: ArialBold, fontWeight: 'bold' },
            { src: ArialItalic, fontStyle: 'italic' },
        ]
    });

    Font.registerHyphenationCallback(word => [word]);

    // Map incoming data to template format
    const candidateData = {
        name: data?.candidate_first_name
            ? `${data.candidate_first_name} ${data.candidate_last_name}`
            : "[First Name] [Last Name]",
        submittedFor: data?.target_role || "[Desired Role]",
        baseSalary: data?.base_salary_min && data?.base_salary_max 
            ? `$${Number(data.base_salary_min).toLocaleString()} - $${Number(data.base_salary_max).toLocaleString()}`
            : "[Compensation details not provided]",
        location: data?.location_preference?.length 
            ? (() => {
                // Show details for each arrangement that has locations
                const details = data.location_preference
                    .filter((pref: any) => pref.locations.length > 0)
                    .map((pref: any) => 
                        `${pref.work_arrangement}: ${pref.locations.join(', ')}`
                    ).join('\n');
                
                // If no details, show just the work arrangements
                return details || [...new Set(data.location_preference.map((pref: any) => pref.work_arrangement))].join(', ');
              })()
            : "[Location preferences not provided]",
        buildAccomplishment: data?.qualifications?.ability_to_scale?.join('\n\n') || 
            "[No information provided]",
        leadershipAccomplishment: data?.qualifications?.leadership_experience?.join('\n\n') || 
            "[No information provided]",
        operationsAccomplishment: data?.qualifications?.operations_experience?.join('\n\n') || 
            "[No information provided]",
        financeAccomplishment: data?.qualifications?.finance_experience?.join('\n\n') || 
            "[No information provided]",
        coreCompetencies: data?.core_competencies?.length 
            ? `<ul>${data.core_competencies.map((item: any) => `<li>${item}</li>`).join('')}</ul>` 
            : "<ul><li>[No core competencies provided]</li></ul>",
        uniqueTraits: data?.unique_attributes?.length 
            ? `<ul>${data.unique_attributes.map((item: any) => `<li>${item}</li>`).join('')}</ul>` 
            : "<ul><li>[No unique attributes provided]</li></ul>",
        proudestAchievement: data?.proudest_achievement || "[No information provided]",
        careerGoals: data?.career_goals?.join('\n\n') || "[No information provided]",
        availability: data?.availability || "[Availability not specified]"
    };

    const styles = StyleSheet.create({
        page: { 
            backgroundColor: 'white', 
            paddingHorizontal: '30pt',
            paddingBottom: '40pt',
            paddingTop: '12pt',
            fontFamily: 'Arial',
            fontSize: '11pt'
        },
        header: {
            marginBottom: '10pt',
        },
        logo: {
            width: 70,
            height: 70,
        },
        title: {
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        candidateInfo: {
            marginBottom: 10,
        },
        candidateField: {
            fontWeight: 'bold',
            marginBottom: 5,
        },
        sectionTitle: {
            color: '#c27ba0',
            fontWeight: 'bold',
            marginBottom: 2,
            marginTop: 7,
        },
        table: {
            display: 'flex',
            width: 'auto',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'black',
            marginBottom: 10,
        },
        tableRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: 'black',
        },
        tableRowLast: {
            flexDirection: 'row',
        },
        tableCol30: {
            width: '35%',
            borderRightWidth: 1,
            borderRightColor: 'black',
            padding: 8,
        },
        tableCol20: {
            width: '20%',
            borderRightWidth: 1,
            borderRightColor: 'black',
            padding: 8,
        },
        tableColLast70: {
            width: '65%',
            padding: 8,
        },
        tableColLast80: {
            width: '80%',
            padding: 8,
        },
        tableCell: {
        },
        tableCellBold: {
            fontWeight: 'bold',
        },
        sectionContent: {
            marginBottom: 10,
        },
        htmlContainer: {
            marginBottom: 10,
            paddingHorizontal: 5,
        },
        availabilityRow: {
            flexDirection: 'row',
            marginTop: 20,
        },
        availabilityLabel: {
            color: '#D896A8',
            marginRight: 5,
        },
        availabilityValue: {
        },
        marginBottom10: {
            marginBottom: 10,
        }
    });

    // HTML için stil tanımları
    const htmlStyles = {
        ul: {
            marginTop: 5,
            marginBottom: 5,
        },
        li: {
            marginBottom: 5,
            fontSize: '11pt',
        },
    };

    return (
        <Document>
            <Page size={[612, 792]} style={styles.page}>
                {/* Logo and Header - Updated to use Image */}
                <View fixed style={styles.header}>
                    <Image
                        src="https://static.wixstatic.com/media/199bb1_8d8f142342634ba894a29f6741a347a2~mv2.png/v1/fill/w_210,h_210,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/right%20hand%20(1).png"
                        style={styles.logo}
                    />
                </View>

                <View style={{ paddingHorizontal: '40pt' }}>

                {/* Title */}
                <Text style={styles.title}>Confidential Candidate Profile</Text>

                {/* Candidate Info */}
                <View style={styles.candidateInfo}>
                    <Text>
                        <Text style={styles.candidateField}>Candidate: </Text>
                        {candidateData.name || ''}
                    </Text>
                    <Text>
                        <Text style={styles.candidateField}>Submitted for: </Text>
                        {candidateData.submittedFor || ''}
                    </Text>
                </View>

                {/* Compensation & Location */}
                <Text style={styles.sectionTitle}>Expected Compensation & Location Preference</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol20}>
                            <Text style={styles.tableCellBold}>Base Salary</Text>
                        </View>
                        <View style={styles.tableColLast80}>
                            <Text style={styles.tableCell}>{candidateData.baseSalary || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={styles.tableCol20}>
                            <Text style={styles.tableCellBold}>Location</Text>
                        </View>
                        <View style={styles.tableColLast80}>
                            <Text style={styles.tableCell}>{candidateData.location || ''}</Text>
                        </View>
                    </View>
                </View>

                {/* Qualification Matching Grid */}
                <Text style={styles.sectionTitle}>Qualification Matching Grid</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol30}>
                            <Text style={styles.tableCellBold}>What Founders Look For</Text>
                        </View>
                        <View style={styles.tableColLast70}>
                            <Text style={styles.tableCellBold}>What Candidate Accomplished</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol30}>
                            <Text style={styles.tableCell}>Ability to build 0→100 and beyond</Text>
                        </View>
                        <View style={styles.tableColLast70}>
                            <Text style={styles.tableCell}>{candidateData.buildAccomplishment || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol30}>
                            <Text style={styles.tableCell}>Leadership experience</Text>
                        </View>
                        <View style={styles.tableColLast70}>
                            <Text style={styles.tableCell}>{candidateData.leadershipAccomplishment || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol30}>
                            <Text style={styles.tableCell}>Operations experience</Text>
                        </View>
                        <View style={styles.tableColLast70}>
                            <Text style={styles.tableCell}>{candidateData.operationsAccomplishment || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRowLast} wrap={false}>
                        <View style={styles.tableCol30}>
                            <Text style={styles.tableCell}>Finance experience</Text>
                        </View>
                        <View style={styles.tableColLast70}>
                            <Text style={styles.tableCell}>{candidateData.financeAccomplishment || ''}</Text>
                        </View>
                    </View>
                </View>

                {/* Core Competencies */}
                <Text style={styles.sectionTitle}>Core Competencies</Text>
                <View style={styles.htmlContainer}>
                    <Html stylesheet={htmlStyles}>{candidateData.coreCompetencies || ''}</Html>
                </View>

                {/* What's Unique */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>What&apos;s Unique</Text>
                    <View style={styles.htmlContainer}>
                        <Html stylesheet={htmlStyles}>{candidateData.uniqueTraits || ''}</Html>
                    </View>
                </View>

                {/* Proudest Achievement */}
                <Text style={styles.sectionTitle}>Proudest Achievement</Text>
                <Text style={styles.sectionContent}>{candidateData.proudestAchievement || ''}</Text>

                {/* Career Goals */}
                <Text style={styles.sectionTitle}>Career Goals</Text>
                <Text style={styles.sectionContent}>{candidateData.careerGoals || ''}</Text>

                {/* Availability */}
                <Text style={styles.sectionTitle}>Availability to interview:</Text>
                <Text style={styles.sectionContent}>{candidateData.availability || ''}</Text>
            </View>
            </Page>
        </Document>
    );
}

export default BlindedResumeTemplate;
