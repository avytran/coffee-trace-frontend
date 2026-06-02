import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ManageLots() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadIPFS = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIpfsUrl(`https://ipfs.io/ipfs/QmFakeHash123456789...`);
      setIsUploading(false);
      alert('Đã tải chứng nhận lên IPFS thành công!');
    }, 2000);
  };

  const onSubmit = (data) => {
    const payload = { ...data, certificateIpfs: ipfsUrl };
    console.log('Dữ liệu sẵn sàng:', payload);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md my-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Khởi Tạo Lô Hàng Cà Phê Mới</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Tên Vùng Trồng:</label>
          <input 
            {...register('farmName', { required: 'Vui lòng điền tên vùng trồng' })}
            className="w-full p-2 border rounded"
          />
          {errors.farmName && <p className="text-red-500 text-sm">{errors.farmName.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Khối lượng (kg):</label>
          <input 
            type="number"
            {...register('harvestWeight', { required: 'Vui lòng nhập khối lượng' })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="p-4 bg-gray-50 rounded border border-dashed">
          <label className="block font-medium mb-1">Tệp chứng nhận chất lượng:</label>
          <input type="file" onChange={handleUploadIPFS} className="block w-full text-sm" />
          {isUploading && <p className="text-blue-500 text-sm mt-1">Đang đẩy tệp lên IPFS...</p>}
          {ipfsUrl && <p className="text-green-600 text-sm mt-1 truncate">Link IPFS: {ipfsUrl}</p>}
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Tiếp tục ký giao dịch
        </button>
      </form>
    </div>
  );
}