import React, { useState } from 'react';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Upload as AntUpload, Button, Form, Input, message, Typography, Space, Alert } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCandidateInfo, setResumeUploaded } from '../../store/slices/interviewSlice';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/api';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = AntUpload;

interface ResumeUploadProps {
  onComplete: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onComplete }) => {
  const dispatch = useDispatch();
  const { resumeUploaded } = useSelector((state: RootState) => state.interview);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{ name?: string | null; email?: string | null; phone?: string | null }>({});

  const beforeUpload = (file: File) => {
    const isPdf = file.type === 'application/pdf';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isPdf && !isDocx) {
      message.error('You can only upload PDF or DOCX files!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return false;
    }
    
    return false; // Prevent auto upload
  };

  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const parseResumeFile = async (file: File) => {
    try {
      return await apiService.parseResume(file);
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file first!');
      return;
    }

    setIsUploading(true);
    try {
      const file = fileList[0].originFileObj as File;
      const result = await parseResumeFile(file);
      
      if (result.success) {
        const { text, extracted_info } = result;
        
        setExtractedInfo(extracted_info);
        
        // Update form with extracted info
        form.setFieldsValue({
          name: extracted_info.name || '',
          email: extracted_info.email || '',
          phone: extracted_info.phone || '',
        });
        
        dispatch(setResumeUploaded({ 
          uploaded: true, 
          text,
          url: URL.createObjectURL(file)
        }));
        
        message.success('Resume uploaded and information extracted successfully!');
      } else {
        throw new Error(result.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFinish = (values: { name: string; email: string; phone: string }) => {
    if (!values.name || !values.email || !values.phone) {
      message.error('Please fill in all required fields!');
      return;
    }
    
    dispatch(setCandidateInfo(values));
    message.success('Information saved successfully!');
    onComplete();
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card className="custom-card" style={{ marginBottom: theme.spacing.lg }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <FileTextOutlined style={{ fontSize: 48, color: theme.colors.primary, marginBottom: theme.spacing.md }} />
            <Title level={3} style={{ color: theme.colors.primary }}>
              Upload Your Resume
            </Title>
            <Paragraph>
              Upload your resume (PDF or DOCX) and we'll extract your information automatically.
            </Paragraph>
          </div>

          {!resumeUploaded ? (
            <Dragger
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              accept=".pdf,.docx"
              style={{ 
                background: theme.colors.gray[50],
                border: `2px dashed ${theme.colors.gray[300]}`,
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: theme.colors.primary }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint" style={{ color: theme.colors.gray[500] }}>
                Support for PDF and DOCX files up to 10MB
              </p>
            </Dragger>
          ) : (
            <Alert
              message="Resume Uploaded Successfully"
              description="Your resume has been processed and information extracted."
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
            />
          )}

          {fileList.length > 0 && !resumeUploaded && (
            <Button
              type="primary"
              size="large"
              loading={isUploading}
              onClick={handleUpload}
              block
            >
              {isUploading ? 'Processing Resume...' : 'Process Resume'}
            </Button>
          )}

          {resumeUploaded && (
            <Card style={{ background: theme.colors.gray[50] }}>
              <Title level={5}>Extracted Information</Title>
              <Space direction="vertical" size="small">
                {extractedInfo.name && (
                  <Text><strong>Name:</strong> {extractedInfo.name}</Text>
                )}
                {extractedInfo.email && (
                  <Text><strong>Email:</strong> {extractedInfo.email}</Text>
                )}
                {extractedInfo.phone && (
                  <Text><strong>Phone:</strong> {extractedInfo.phone}</Text>
                )}
                {!extractedInfo.name && !extractedInfo.email && !extractedInfo.phone && (
                  <Text type="secondary">No information could be automatically extracted. Please fill in manually below.</Text>
                )}
              </Space>
            </Card>
          )}
        </Space>
      </Card>

      {resumeUploaded && (
        <Card className="custom-card">
          <Title level={4} style={{ marginBottom: theme.spacing.lg }}>
            Confirm Your Information
          </Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: extractedInfo.name || '',
              email: extractedInfo.email || '',
              phone: extractedInfo.phone || '',
            }}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your full name!' }]}
            >
              <Input size="large" placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input size="large" placeholder="Enter your email address" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: 'Please enter your phone number!' }]}
            >
              <Input size="large" placeholder="Enter your phone number" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" size="large" htmlType="submit" block>
                Continue to Interview
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ResumeUpload;
